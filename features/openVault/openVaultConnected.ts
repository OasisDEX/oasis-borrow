import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { applyChange, ApplyChange, Change, Changes } from 'helpers/form'
import { zero } from 'helpers/zero'
import { combineLatest, Observable, of, Subject, merge } from 'rxjs'
import { switchMap, map, scan, shareReplay } from 'rxjs/operators'
import { curry } from 'lodash'

export type OpenVaultConnectedStage =
  | 'editingConnected'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxyWaitToContinue'
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'allowanceWaitToContinue'
  | 'openWaitingForConfirmation'
  | 'openWaitingForApproval'
  | 'openInProgress'
  | 'openFailure'
  | 'openWaitToContinue'

type OpenVaultConnectedChange = Changes<OpenVaultConnectedState>

export type ManualChange =
  | Change<OpenVaultConnectedState, 'depositAmount'>
  | Change<OpenVaultConnectedState, 'generateAmount'>

const apply: ApplyChange<OpenVaultConnectedState> = applyChange

export interface OpenVaultConnectedState {
  stage: OpenVaultConnectedStage
  token: string
  ilk: string
  messages: string[]
  depositAmount: BigNumber
  generateAmount: BigNumber
  maxDepositAmount: BigNumber
  maxGenerateAmount: BigNumber
  balance: BigNumber
  ethBalance: BigNumber
  price: BigNumber
  account: string
  progress?: () => void
  proxyAddress?: string
  allowance?: boolean
  change?: (change: ManualChange) => void
}

type OpenVaultMessage = {
  kind:
    | 'lockAmountEmpty'
    | 'lockAmountGreaterThanBalance'
    | 'lockAmountGreaterThanMaxLockAmount'
    | 'drawAmountLessThanDebtFloor'
    | 'drawAmountGreaterThanDebtCeiling'
    | 'drawAmountPossibleLessThanDebtFloor'
    | 'vaultUnderCollateralized'
}

function validate(state: OpenVaultConnectedState): OpenVaultConnectedState {
  // const { lockAmount, drawAmount, maxLockAmount, maxDrawAmount, ilkData } = state
  // const { ilkDebtAvailable, debtFloor, maxDebtPerUnitCollateral } = ilkData!

  // const messages: OpenVaultModalMessage[] = []

  // if (!lockAmount || lockAmount.eq(zero)) {
  //   messages.push({ kind: 'lockAmountEmpty' })
  // }

  // if (lockAmount && maxLockAmount && lockAmount.gt(maxLockAmount)) {
  //   messages[messages.length] = { kind: 'lockAmountGreaterThanMaxLockAmount' }
  // }

  // if (drawAmount && drawAmount.lt(debtFloor)) {
  //   messages[messages.length] = { kind: 'drawAmountLessThanDebtFloor' }
  // }

  // if (maxDrawAmount && maxDrawAmount.lt(debtFloor)) {
  //   messages[messages.length] = { kind: 'drawAmountPossibleLessThanDebtFloor' }
  // }

  // if (drawAmount && drawAmount.gt(ilkDebtAvailable)) {
  //   messages[messages.length] = { kind: 'drawAmountGreaterThanDebtCeiling' }
  // }

  // if (drawAmount && lockAmount && drawAmount.gt(lockAmount.times(maxDebtPerUnitCollateral))) {
  //   messages[messages.length] = { kind: 'vaultUnderCollateralized' }
  // }

  return { ...state, messages: [] }
}

function addTransitions(
  context: ContextConnected,
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  allowance$: Observable<boolean>,
  change: (ch: OpenVaultConnectedChange) => void,
  state: OpenVaultConnectedState,
): OpenVaultConnectedState {
  // function backToOpenVaultModalEditing() {
  //   change({ kind: 'stage', stage: 'editing' })
  // }

  // function close() {
  //   change({ kind: 'stage', stage: 'editing' })
  //   change({ kind: 'lockAmount', lockAmount: undefined })
  //   change({ kind: 'drawAmount', drawAmount: undefined })
  //   change({ kind: 'maxLockAmount', maxLockAmount: undefined })
  //   change({ kind: 'maxDrawAmount', maxDrawAmount: undefined })
  // }

  // if (state.stage === 'editing') {
  //   return {
  //     ...state,
  //     change,
  //     proceed: !state.messages.length
  //       ? () => {
  //           if (!state.proxyAddress) {
  //             change({ kind: 'stage', stage: 'proxyWaitingForConfirmation' })
  //           } else if (!state.allowance) {
  //             change({ kind: 'stage', stage: 'allowanceWaitingForConfirmation' })
  //           } else {
  //             change({ kind: 'stage', stage: 'transactionWaitingForConfirmation' })
  //           }
  //         }
  //       : undefined,
  //   }
  // }

  // if (state.stage === 'proxyWaitingForConfirmation') {
  //   return {
  //     ...state,
  //     createProxy: () => createProxy(context, txHelpers, proxyAddress$, change, state),
  //   }
  // }

  // if (state.stage === 'proxyFiasco') {
  //   return {
  //     ...state,
  //     tryAgain: () => createProxy(context, txHelpers, proxyAddress$, change, state),
  //   }
  // }

  // if (state.stage === 'allowanceWaitingForConfirmation') {
  //   return {
  //     ...state,
  //     setAllowance: () => setAllowance(txHelpers, allowance$, change, state),
  //   }
  // }

  // if (state.stage === 'allowanceFiasco') {
  //   return {
  //     ...state,
  //     tryAgain: () => setAllowance(txHelpers, allowance$, change, state),
  //   }
  // }

  // if (state.stage === 'waitToContinue') {
  //   return {
  //     ...state,
  //     proceed: () => change({ kind: 'stage', stage: 'transactionWaitingForConfirmation' }),
  //   }
  // }

  // if (state.stage === 'transactionWaitingForConfirmation') {
  //   return {
  //     ...state,
  //     openVault: () => openVault(txHelpers, change, state),
  //     back: backToOpenVaultModalEditing,
  //   }
  // }

  // if (state.stage === 'transactionFiasco') {
  //   return {
  //     ...state,
  //     tryAgain: () => openVault(txHelpers, change, state),
  //     back: backToOpenVaultModalEditing,
  //   }
  // }

  // if (state.stage === 'transactionSuccess') {
  //   return {
  //     ...state,
  //     close,
  //   }
  // }

  return state
}

export function createOpenVaultConnected$(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<boolean>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  context: ContextConnected,
  ilk: string,
  token: string,
): Observable<OpenVaultConnectedState> {
  const account = context.account

  return combineLatest(
    txHelpers$,
    balance$(token, account),
    balance$('ETH', account),
    tokenOraclePrice$(token),
    ilkData$(ilk),
    proxyAddress$(account),
  ).pipe(
    switchMap(([txHelpers, balance, ethBalance, price, ilkData, proxyAddress]) =>
      ((proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)).pipe(
        switchMap((allowance: boolean | undefined) => {
          const initialState: OpenVaultConnectedState = {
            stage: 'editingConnected',
            token,
            account,
            balance,
            ethBalance,
            messages: [],
            depositAmount: zero,
            generateAmount: zero,
            maxDepositAmount: zero,
            maxGenerateAmount: zero,
            price,
            ilk,
          }

          const change$ = new Subject<OpenVaultConnectedChange>()

          function change(ch: OpenVaultConnectedChange) {
            change$.next(ch)
          }

          const balanceChange$ = balance$(token, account).pipe(
            map((balance) => ({ kind: 'balance', balance })),
          )

          const ethBalanceChange$ = balance$('ETH', account).pipe(
            map((ethBalance) => ({ kind: 'ethBalance', ethBalance })),
          )

          const maxLockAmountChange$ = balance$(token, account).pipe(
            map((balance) => {
              const maxLockAmount =
                token !== 'ETH' ? balance : balance.gt(0.05) ? balance.minus(0.05) : zero
              return { kind: 'maxLockAmount', maxLockAmount }
            }),
          )

          const priceChange$ = tokenOraclePrice$(ilk).pipe(
            map((price) => ({ kind: 'price', price })),
          )

          const ilkDataChange$ = ilkData$(ilk).pipe(
            map((ilkData) => ({ kind: 'ilkData', ilkData })),
          )

          const environmentChange$ = merge(
            balanceChange$,
            ilkDataChange$,
            priceChange$,
            ethBalanceChange$,
            maxLockAmountChange$,
          )

          const connectedProxyAddress$ = proxyAddress$(account)

          const connectedAllowance$ = connectedProxyAddress$.pipe(
            switchMap((proxyAddress) =>
              proxyAddress ? allowance$(token, account, proxyAddress) : of(false),
            ),
          )

          return merge(change$, environmentChange$).pipe(
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
            shareReplay(1),
          )
        }),
      ),
    ),
  )
}
