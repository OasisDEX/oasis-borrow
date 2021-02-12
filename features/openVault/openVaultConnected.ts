import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { applyChange, ApplyChange, Change, Changes } from 'helpers/form'
import { zero } from 'helpers/zero'
import { combineLatest, Observable, of, Subject, merge } from 'rxjs'
import { switchMap, map, scan, shareReplay, first } from 'rxjs/operators'
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

interface TokenBalancePriceInfo {
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  ethBalance: BigNumber
  ethPrice: BigNumber
  daiBalance: BigNumber
}

export interface OpenVaultConnectedState extends TokenBalancePriceInfo {
  stage: OpenVaultConnectedStage
  token: string
  ilk: string
  messages: OpenVaultMessage[]
  depositAmount: BigNumber
  generateAmount: BigNumber
  account: string
  progress?: () => void
  proxyAddress?: string
  allowance?: boolean
  change?: (change: ManualChange) => void

  maxDebtPerUnitCollateral: BigNumber
  ilkDebtAvailable: BigNumber
  debtFloor: BigNumber
  liquidationRatio: BigNumber

  maxDepositAmount: BigNumber
  maxGenerateAmount: BigNumber
  collateralizationRatio: BigNumber
  depositAmountUSD: BigNumber
  generateAmountUSD: BigNumber
  maxDepositAmountUSD: BigNumber
}

type OpenVaultMessage = {
  kind:
    | 'depositAmountEmpty'
    | 'depositAmountGreaterThanMaxDepositAmount'
    | 'generateAmountLessThanDebtFloor'
    | 'generateAmountGreaterThanDebtCeiling'
    | 'potentialGenerateAmountLessThanDebtFloor'
    | 'vaultUnderCollateralized'
}

function validate(state: OpenVaultConnectedState): OpenVaultConnectedState {
  const {
    depositAmount,
    maxDepositAmount,
    depositAmountUSD,
    generateAmount,
    debtFloor,
    ilkDebtAvailable,
    collateralizationRatio,
    liquidationRatio,
  } = state

  const messages: OpenVaultMessage[] = []

  if (depositAmount.eq(zero)) {
    messages.push({ kind: 'depositAmountEmpty' })
  }

  if (depositAmount.gt(maxDepositAmount)) {
    messages.push({ kind: 'depositAmountGreaterThanMaxDepositAmount' })
  }

  if (generateAmount.lt(debtFloor)) {
    messages.push({ kind: 'generateAmountLessThanDebtFloor' })
  }

  if (depositAmountUSD.lt(debtFloor)) {
    messages.push({ kind: 'potentialGenerateAmountLessThanDebtFloor' })
  }

  if (generateAmount.gt(ilkDebtAvailable)) {
    messages.push({ kind: 'generateAmountGreaterThanDebtCeiling' })
  }

  if (generateAmount.gt(zero) && collateralizationRatio.lt(liquidationRatio)) {
    messages.push({ kind: 'vaultUnderCollateralized' })
  }

  return { ...state, messages }
}

function applyCalculations(state: OpenVaultConnectedState): OpenVaultConnectedState {
  const {
    collateralBalance,
    depositAmount,
    maxDebtPerUnitCollateral,
    generateAmount,
    collateralPrice,
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(collateralPrice)

  const maxGenerateAmount = depositAmount.times(maxDebtPerUnitCollateral)

  const depositAmountUSD = collateralPrice.times(depositAmount)
  const generateAmountUSD = generateAmount // 1 DAI === 1 USD

  const collateralizationRatio = generateAmountUSD.eq(zero)
    ? zero
    : depositAmountUSD.div(generateAmountUSD)
  return {
    ...state,
    maxDepositAmount,
    maxGenerateAmount,
    collateralizationRatio,
    depositAmountUSD,
    generateAmountUSD,
    maxDepositAmountUSD,
  }
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

  if (state.stage === 'editingConnected') {
    return {
      ...state,
      change,
      proceed: !state.messages.length
        ? () => {
            if (!state.proxyAddress) {
              change({ kind: 'stage', stage: 'proxyWaitingForConfirmation' })
            } else if (!state.allowance) {
              change({ kind: 'stage', stage: 'allowanceWaitingForConfirmation' })
            } else {
              change({ kind: 'stage', stage: 'openWaitingForConfirmation' })
            }
          }
        : undefined,
    }
  }

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
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<boolean>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  context: ContextConnected,
  txHelpers: TxHelpers,
  ilk: string,
  token: string,
): Observable<OpenVaultConnectedState> {
  const account = context.account

  const tokenInformation$: Observable<TokenBalancePriceInfo> = combineLatest(
    balance$(token, account),
    tokenOraclePrice$(token),
    balance$('ETH', account),
    tokenOraclePrice$('ETH'),
    balance$('DAI', account),
  ).pipe(
    switchMap(([collateralBalance, collateralPrice, ethBalance, ethPrice, daiBalance]) =>
      of({
        collateralBalance,
        collateralPrice,
        ethBalance,
        ethPrice,
        daiBalance,
      }),
    ),
  )

  return combineLatest(tokenInformation$, ilkData$(ilk), proxyAddress$(account)).pipe(
    switchMap(
      ([
        { collateralBalance, collateralPrice, ethBalance, ethPrice, daiBalance },
        { maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor, liquidationRatio },
        proxyAddress,
      ]) =>
        ((proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)).pipe(
          switchMap((allowance: boolean | undefined) => {
            const initialState: OpenVaultConnectedState = {
              stage: 'editingConnected',
              token,
              account,
              collateralBalance,
              collateralPrice,
              ethBalance,
              ethPrice,
              daiBalance,
              messages: [],
              depositAmount: zero,
              generateAmount: zero,
              maxDepositAmount: zero,
              maxGenerateAmount: zero,
              collateralizationRatio: zero,
              depositAmountUSD: zero,
              generateAmountUSD: zero,
              maxDepositAmountUSD: zero,
              ilk,
              maxDebtPerUnitCollateral,
              ilkDebtAvailable,
              debtFloor,
              liquidationRatio,
            }

            const change$ = new Subject<OpenVaultConnectedChange>()

            function change(ch: OpenVaultConnectedChange) {
              change$.next(ch)
            }

            const collateralBalanceChange$ = balance$(token, account).pipe(
              map((collateralBalance) => ({ kind: 'collateralBalance', collateralBalance })),
            )

            const ethBalanceChange$ = balance$('ETH', account).pipe(
              map((ethBalance) => ({ kind: 'ethBalance', ethBalance })),
            )

            const daiBalanceChange$ = balance$('DAI', account).pipe(
              map((daiBalance) => ({ kind: 'daiBalance', daiBalance })),
            )

            const collateralPriceChange$ = tokenOraclePrice$(ilk).pipe(
              map((collateralPrice) => ({ kind: 'collateralPrice', collateralPrice })),
            )

            const ilkDataChange$ = ilkData$(ilk).pipe(
              map(({ maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor }) => [
                {
                  kind: 'maxDebtPerUnitCollateral',
                  maxDebtPerUnitCollateral,
                },
                {
                  kind: 'ilkDebtAvailable',
                  ilkDebtAvailable,
                },
                {
                  kind: 'debtFloor',
                  debtFloor,
                },
              ]),
            )

            const environmentChange$ = merge(
              collateralBalanceChange$,
              ethBalanceChange$,
              daiBalanceChange$,
              collateralPriceChange$,
              ilkDataChange$,
            )

            const connectedProxyAddress$ = proxyAddress$(account)

            const connectedAllowance$ = connectedProxyAddress$.pipe(
              switchMap((proxyAddress) =>
                proxyAddress ? allowance$(token, account, proxyAddress) : of(false),
              ),
            )

            return merge(change$, environmentChange$).pipe(
              scan(apply, initialState),
              map(applyCalculations),
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
