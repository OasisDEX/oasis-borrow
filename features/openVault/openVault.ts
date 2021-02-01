import BigNumber from 'bignumber.js'
import { TxHelpers } from 'components/AppContext'
import { approve, ApproveData } from 'components/blockchain/calls/erc20'
import { createDsProxy, CreateDsProxyData } from 'components/blockchain/calls/proxyRegistry'
import { TxMetaKind } from 'components/blockchain/calls/txMeta'
import { IlkData } from 'components/blockchain/ilks'
import { ContextConnected } from 'components/blockchain/network'
import { TxStatus } from 'components/blockchain/transactions'
import {
  ApplyChange,
  applyChange,
  Change,
  Changes,
  GasEstimationStatus,
  HasGasEstimation,
  transactionToX,
} from 'helpers/form'
import { curry } from 'lodash'
import { combineLatest, EMPTY, merge, Observable, of, Subject } from 'rxjs'
import { filter, first, map, scan, switchMap } from 'rxjs/operators'

export type VaultCreationStage =
  | 'proxyWaiting4Confirmation'
  | 'proxyWaiting4Approval'
  | 'proxyInProgress'
  | 'proxyFiasco'
  | 'allowanceWaiting4Confirmation'
  | 'allowanceWaiting4Approval'
  | 'allowanceInProgress'
  | 'allowanceFiasco'
  | 'editingWaiting4Continue'
  | 'editing'
  | 'openVaultWaiting4Confirmation'
  | 'openVaultWaiting4Approval'
  | 'openVaultInProgress'
  | 'openVaultFiasco'
  | 'openVaultSuccess'

type VaultCreationMessage = {
  kind: 'amountIsEmpty' | 'amountBiggerThanBalance'
}

type VaultCreationChange = Changes<VaultCreationState>

type ManualChange =
  | Change<VaultCreationState, 'lockAmount'>
  | Change<VaultCreationState, 'drawAmount'>

export interface VaultCreationState extends HasGasEstimation {
  stage: VaultCreationStage
  proxyAddress?: string
  proxyTxHash?: string
  proxyConfirmations?: number
  safeConfirmations: number
  allowanceTxHash?: string
  openVaultTxHash?: string
  ilk: string
  token: string
  ilkData: IlkData
  balance: BigNumber
  // emergency shutdown!
  lockAmount?: BigNumber
  drawAmount?: BigNumber
  messages: VaultCreationMessage[]
  txError?: any
  change?: (change: ManualChange) => void
  createProxy?: () => void
  setAllowance?: () => void
  continue2ConfirmOpenVault?: () => void
  openVault?: () => void
  continue2Editing?: () => void
  tryAgain?: () => void
  back?: () => void
  close?: () => void
}

const apply: ApplyChange<VaultCreationState> = applyChange

function createProxy(
  { safeConfirmations }: ContextConnected,
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: VaultCreationChange) => void,
) {
  sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy })
    .pipe(
      transactionToX<VaultCreationChange, CreateDsProxyData>(
        { kind: 'stage', stage: 'proxyWaiting4Approval' },
        (txState) =>
          of(
            { kind: 'proxyTxHash', proxyTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'proxyInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'proxyFiasco',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        (txState) => {
          return proxyAddress$.pipe(
            filter((proxyAddress) => !!proxyAddress),
            switchMap((proxyAddress) =>
              (txState as any).confirmations < safeConfirmations
                ? of({
                    kind: 'proxyConfirmations',
                    proxyConfirmations: (txState as any).confirmations,
                  })
                : of(
                    { kind: 'proxyAddress', proxyAddress: proxyAddress! },
                    { kind: 'stage', stage: 'allowanceWaiting4Confirmation' },
                  ),
            ),
          )
        },
        safeConfirmations,
      ),
    )
    .subscribe((ch) => change(ch))
}

function setAllowance(
  { sendWithGasEstimation }: TxHelpers,
  allowance$: Observable<boolean>,
  change: (ch: VaultCreationChange) => void,
  state: VaultCreationState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: state.token,
    spender: state.proxyAddress!,
  })
    .pipe(
      transactionToX<VaultCreationChange, ApproveData>(
        { kind: 'stage', stage: 'allowanceWaiting4Approval' },
        (txState) =>
          of(
            {
              kind: 'allowanceTxHash',
              allowanceTxHash: (txState as any).txHash as string,
            },
            { kind: 'stage', stage: 'allowanceInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'allowanceFiasco',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        () =>
          allowance$.pipe(
            filter((allowance) => allowance),
            switchMap(() => of({ kind: 'stage', stage: 'editingWaiting4Continue' })),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

// // openVault
// function openVault(
//   { sendWithGasEstimation }: TxHelpers,
//   change: (ch: VaultCreationChange) => void,
//   { amount, proxyAddress }: VaultCreationState,
// ) {
//   sendWithGasEstimation(join, {
//     kind: TxMetaKind.dsrJoin,
//     proxyAddress: proxyAddress!,
//     amount: amount!,
//   })
//     .pipe(
//       transactionToX<VaultCreationChange, DsrJoinData>(
//         { kind: 'stage', stage: 'openVaultWaiting4Approval' },
//         (txState) =>
//           of(
//             { kind: 'openVaultTxHash', openVaultTxHash: (txState as any).txHash as string },
//             { kind: 'stage', stage: 'openVaultInProgress' },
//           ),
//         (txState) => {
//           return of(
//             {
//               kind: 'stage',
//               stage: 'openVaultFiasco',
//             },
//             {
//               kind: 'txError',
//               txError:
//                 txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
//                   ? txState.error
//                   : undefined,
//             },
//           )
//         },
//         () => of({ kind: 'stage', stage: 'openVaultSuccess' }),
//       ),
//     )
//     .subscribe((ch) => change(ch))
// }

function addTransitions(
  context: ContextConnected,
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  allowance$: Observable<boolean>,
  change: (ch: VaultCreationChange) => void,
  state: VaultCreationState,
): VaultCreationState {
  function backToopenVaultDai() {
    change({ kind: 'stage', stage: 'editing' })
  }

  function close() {
    change({ kind: 'lockAmount', value: undefined })
    change({ kind: 'drawAmount', value: undefined })
    change({ kind: 'stage', stage: 'editing' })
  }

  if (state.stage === 'proxyWaiting4Confirmation') {
    return {
      ...state,
      createProxy: () => createProxy(context, txHelpers, proxyAddress$, change),
    }
  }

  if (state.stage === 'proxyFiasco') {
    return {
      ...state,
      tryAgain: () => createProxy(context, txHelpers, proxyAddress$, change),
    }
  }

  if (state.stage === 'allowanceWaiting4Confirmation') {
    return {
      ...state,
      setAllowance: () => setAllowance(txHelpers, allowance$, change, state),
    }
  }

  if (state.stage === 'allowanceFiasco') {
    return {
      ...state,
      tryAgain: () => setAllowance(txHelpers, allowance$, change, state),
    }
  }

  if (state.stage === 'editingWaiting4Continue') {
    return {
      ...state,
      continue2Editing: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }

  if (state.stage === 'editing') {
    if (state.messages.length === 0) {
      return {
        ...state,
        change,
        continue2ConfirmOpenVault: () =>
          change({ kind: 'stage', stage: 'openVaultWaiting4Confirmation' }),
      }
    }
    return {
      ...state,
      change,
    }
  }

  if (state.stage === 'openVaultWaiting4Confirmation') {
    return {
      ...state,
      openVault: () => openVault(txHelpers, change, state),
      back: backToopenVaultDai,
    }
  }

  if (state.stage === 'openVaultFiasco') {
    return {
      ...state,
      tryAgain: () => openVault(txHelpers, change, state),
      back: backToopenVaultDai,
    }
  }

  if (state.stage === 'openVaultSuccess') {
    return {
      ...state,
      close,
    }
  }

  return state
}

function validate(state: VaultCreationState): VaultCreationState {
  // const messages: DsrCreationMessage[] = []
  // if (!state.amount || state.amount.eq(zero)) {
  //   messages[messages.length] = { kind: 'amountIsEmpty' }
  // }
  // if (state.amount && state.daiBalance && state.amount.gt(state.daiBalance)) {
  //   messages[messages.length] = { kind: 'amountBiggerThanBalance' }
  // }
  // return { ...state, messages }
  return state
}

// function constructEstimateGas(
//   addGasEstimation: AddGasEstimationFunction,
//   state: VaultCreationState,
// ): Observable<VaultCreationState> {
//   return addGasEstimation(state, ({ estimateGas }: TxHelpers) => {
//     const { proxyAddress, stage, amount } = state
//
//     if (stage === 'proxyWaiting4Confirmation' || stage === 'proxyFiasco') {
//       return estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy })
//     }
//
//     if (
//       proxyAddress &&
//       (stage === 'allowanceWaiting4Confirmation' || stage === 'allowanceFiasco')
//     ) {
//       return estimateGas(approve, {
//         token: 'DAI',
//         spender: proxyAddress,
//         kind: TxMetaKind.approve,
//       })
//     }
//
//     return undefined
//   })
// }

export function createOpenVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<boolean>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilk: string,
): Observable<any> {
  return combineLatest(context$, txHelpers$).pipe(
    first(),
    switchMap(([context, txHelpers]) => {
      const account = context.account
      const token = ilk.split('-')[0]

      return combineLatest(proxyAddress$(account), balance$(token, account), ilkData$(ilk)).pipe(
        switchMap(([proxyAddress, balance, ilkData]) =>
          ((proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)).pipe(
            switchMap((allowance: boolean | undefined) => {
              const stage =
                (!proxyAddress && 'proxyWaiting4Confirmation') ||
                (!allowance && 'allowanceWaiting4Confirmation') ||
                'editing'
              const initialState: VaultCreationState = {
                stage,
                balance,
                ilkData,
                ilk,
                token,
                proxyAddress,
                messages: [],
                safeConfirmations: context.safeConfirmations,
                gasEstimationStatus: GasEstimationStatus.unset,
              }

              const change$ = new Subject<VaultCreationChange>()

              function change(ch: VaultCreationChange) {
                change$.next(ch)
              }

              const balanceChange$ = balance$(account, token).pipe(
                map((value) => ({ kind: 'balance', value })),
              )

              const ilkDataChange$ = ilkData$(ilk).pipe(
                map((value) => ({ kind: 'ilkData', value })),
              )

              const environmentChange$ = merge(balanceChange$, ilkDataChange$)

              const connectedProxyAddress$ = proxyAddress$(account)
              const connectedAllowance$ = proxyAddress$(account).pipe(
                switchMap((proxyAddress) =>
                  proxyAddress ? allowance$(token, account, proxyAddress) : EMPTY,
                ),
              )

              return combineLatest(change$, environmentChange$).pipe(
                scan(apply, initialState),
                map(validate),
                map(
                  curry(addTransitions)(
                    context,
                    txHelpers,
                    connectedProxyAddress$,
                    connectedAllowance$,
                    change,
                  ),
                ),
              )
            }),
          ),
        ),
      )
    }),
  )
}
