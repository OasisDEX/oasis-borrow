import BigNumber from 'bignumber.js'
import { TxHelpers } from 'components/AppContext'
import { TxMetaKind } from 'components/blockchain/calls/txMeta'
import { ContextConnected } from 'components/blockchain/network'
import { TxStatus } from 'components/blockchain/transactions'
import { setupDSProxy, SetupDSProxyData } from 'components/dashboard/dsrPot/dsProxyCalls'
import { approve, ApproveData } from 'components/dashboard/dsrPot/erc20Calls'
import { DsrJoinData, join } from 'components/dashboard/dsrPot/potCalls'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { filter, first, map, mergeMap, scan, shareReplay, switchMap } from 'rxjs/operators'
import { UnreachableCaseError } from 'ts-essentials'

export type DsrCreationStage =
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
  | 'depositWaiting4Confirmation'
  | 'depositWaiting4Approval'
  | 'depositInProgress'
  | 'depositFiasco'
  | 'depositSuccess'

type DsrCreationMessage = {
  kind: 'amountIsEmpty' | 'amountBiggerThanBalance'
}

export type ManualChange = {
  kind: 'amount'
  amount?: BigNumber
}

type StageChange = {
  kind: 'stage'
  stage: DsrCreationStage
}

type ProxyTxHashChange = {
  kind: 'proxyTxHash'
  proxyTxHash: string
}

type DepositTxHashChange = {
  kind: 'depositTxHash'
  depositTxHash: string
}

type ProxyAddressChange = {
  kind: 'proxyAddress'
  proxyAddress: string
}

interface AllowanceTxHashChange {
  kind: 'allowanceTxHash'
  allowanceTxHash: string
}

interface DaiBalanceChange {
  kind: 'daiBalance'
  daiBalance: BigNumber
}

interface ConfirmationsChange {
  kind: 'proxyConfirmations'
  proxyConfirmations: number
}

interface TxErrorChange {
  kind: 'txError'
  txError: any
}

type DsrCreationChange =
  | ManualChange
  | StageChange
  | ProxyTxHashChange
  | ProxyAddressChange
  | AllowanceTxHashChange
  | DaiBalanceChange
  | DepositTxHashChange
  | ConfirmationsChange
  | TxErrorChange

export interface DsrCreationState {
  stage: DsrCreationStage
  proxyAddress?: string
  proxyTxHash?: string
  proxyConfirmations?: number
  safeConfirmations: number
  allowanceTxHash?: string
  depositTxHash?: string
  daiBalance: BigNumber
  amount?: BigNumber
  messages: DsrCreationMessage[]
  txError?: any
  change?: (change: ManualChange) => void
  createProxy?: () => void
  setAllowance?: () => void
  continue2ConfirmDeposit?: () => void
  deposit?: () => void
  continue2Editing?: () => void
  tryAgain?: () => void
  back?: () => void
  close?: () => void
}

function applyChange(state: DsrCreationState, change: DsrCreationChange): DsrCreationState {
  if (change.kind === 'amount') {
    return { ...state, amount: change.amount }
  }

  if (change.kind === 'stage') {
    return { ...state, stage: change.stage }
  }

  if (change.kind === 'allowanceTxHash') {
    return { ...state, allowanceTxHash: change.allowanceTxHash }
  }

  if (change.kind === 'proxyTxHash') {
    return { ...state, proxyTxHash: change.proxyTxHash }
  }

  if (change.kind === 'proxyAddress') {
    return { ...state, proxyAddress: change.proxyAddress }
  }

  if (change.kind === 'daiBalance') {
    return { ...state, daiBalance: change.daiBalance }
  }

  if (change.kind === 'depositTxHash') {
    return { ...state, depositTxHash: change.depositTxHash }
  }

  if (change.kind === 'proxyConfirmations') {
    return { ...state, proxyConfirmations: change.proxyConfirmations }
  }

  if (change.kind === 'txError') {
    return { ...state, txError: change.txError }
  }

  throw new UnreachableCaseError(change)
}

function createProxy(
  { safeConfirmations }: ContextConnected,
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: DsrCreationChange) => void,
) {
  sendWithGasEstimation(setupDSProxy, { kind: TxMetaKind.setupDSProxy })
    .pipe(
      transactionToX<DsrCreationChange, SetupDSProxyData>(
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
  daiAllowance$: Observable<boolean>,
  change: (ch: DsrCreationChange) => void,
  state: DsrCreationState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: 'DAI',
    spender: state.proxyAddress!,
  })
    .pipe(
      transactionToX<DsrCreationChange, ApproveData>(
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
          daiAllowance$.pipe(
            filter((daiAllowance) => daiAllowance),
            switchMap(() => of({ kind: 'stage', stage: 'editingWaiting4Continue' })),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

function deposit(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: DsrCreationChange) => void,
  { amount, proxyAddress }: DsrCreationState,
) {
  sendWithGasEstimation(join, {
    kind: TxMetaKind.dsrJoin,
    proxyAddress: proxyAddress!,
    amount: amount!,
  })
    .pipe(
      transactionToX<DsrCreationChange, DsrJoinData>(
        { kind: 'stage', stage: 'depositWaiting4Approval' },
        (txState) =>
          of(
            { kind: 'depositTxHash', depositTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'depositInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'depositFiasco',
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
        () => of({ kind: 'stage', stage: 'depositSuccess' }),
      ),
    )
    .subscribe((ch) => change(ch))
}

function addTransitions(
  context: ContextConnected,
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  daiAllowance$: Observable<boolean>,
  change: (ch: DsrCreationChange) => void,
  state: DsrCreationState,
): DsrCreationState {
  function backToDepositDai() {
    change({ kind: 'stage', stage: 'editing' })
  }

  function close() {
    change({ kind: 'amount', amount: undefined })
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
      setAllowance: () => setAllowance(txHelpers, daiAllowance$, change, state),
    }
  }

  if (state.stage === 'allowanceFiasco') {
    return {
      ...state,
      tryAgain: () => setAllowance(txHelpers, daiAllowance$, change, state),
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
        continue2ConfirmDeposit: () =>
          change({ kind: 'stage', stage: 'depositWaiting4Confirmation' }),
      }
    }
    return {
      ...state,
      change,
    }
  }

  if (state.stage === 'depositWaiting4Confirmation') {
    return {
      ...state,
      deposit: () => deposit(txHelpers, change, state),
      back: backToDepositDai,
    }
  }

  if (state.stage === 'depositFiasco') {
    return {
      ...state,
      tryAgain: () => deposit(txHelpers, change, state),
      back: backToDepositDai,
    }
  }

  if (state.stage === 'depositSuccess') {
    return {
      ...state,
      close,
    }
  }

  return state
}

function validate(state: DsrCreationState): DsrCreationState {
  const messages: DsrCreationMessage[] = []
  if (!state.amount || state.amount.eq(zero)) {
    messages[messages.length] = { kind: 'amountIsEmpty' }
  }
  if (state.amount && state.daiBalance && state.amount.gt(state.daiBalance)) {
    messages[messages.length] = { kind: 'amountBiggerThanBalance' }
  }
  return { ...state, messages }
}

export function createDsrCreation$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  daiAllowance$: Observable<boolean>,
  daiBalance$: Observable<BigNumber>,
): Observable<DsrCreationState> {
  return combineLatest(context$, proxyAddress$, txHelpers$, daiAllowance$, daiBalance$).pipe(
    first(),
    switchMap(([context, proxyAddress, txHelpers, daiAllowance, daiBalance]) => {
      const change$ = new Subject<DsrCreationChange>()
      function change(ch: DsrCreationChange) {
        change$.next(ch)
      }

      const stage =
        (!proxyAddress && 'proxyWaiting4Confirmation') ||
        (!daiAllowance && 'allowanceWaiting4Confirmation') ||
        'editing'

      const initialState: DsrCreationState = {
        stage,
        daiBalance,
        proxyAddress,
        messages: [],
        safeConfirmations: context.safeConfirmations,
      }

      const daiBalanceChange$: Observable<DaiBalanceChange> = daiBalance$.pipe(
        map((daiBalance) => ({ kind: 'daiBalance', daiBalance })),
      )

      const addressChange$ = context$.pipe(
        map((ctx) => ctx.account),
        filter((account) => account !== context.account),
        mergeMap(() => {
          return combineLatest(daiAllowance$, proxyAddress$).pipe(
            switchMap(([daiAllowance, proxyAddress]) => {
              const stage =
                (!proxyAddress && 'proxyWaiting4Confirmation') ||
                (!daiAllowance && 'allowanceWaiting4Confirmation') ||
                'editing'

              return of({ kind: 'stage', stage }, { kind: 'proxyAddress', proxyAddress })
            }),
          )
        }),
      )

      return merge(change$, daiBalanceChange$, addressChange$).pipe(
        scan(applyChange, initialState),
        map(validate),
        map(curry(addTransitions)(context, txHelpers, proxyAddress$, daiAllowance$, change)),
      )
    }),
    shareReplay(1),
  )
}
