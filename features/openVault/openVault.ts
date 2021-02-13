import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { applyChange, ApplyChange, Change, Changes } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { Observable, of, iif, combineLatest, merge, Subject } from 'rxjs'
import { startWith, switchMap, map, scan, shareReplay } from 'rxjs/operators'

const defaultIsStates = {
  isIlkValidationStage: false,
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}

function applyIsStageStates(state: OpenVaultState): OpenVaultState {
  const newState = {
    ...state,
    ...defaultIsStates,
  }

  switch (state.stage) {
    case 'ilkValidationFailure':
    case 'ilkValidationLoading':
    case 'ilkValidationSuccess':
      return {
        ...newState,
        isIlkValidationStage: true,
      }
    case 'editing':
      return {
        ...newState,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxyWaitToContinue':
      return {
        ...newState,
        isProxyStage: true,
      }
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceWaitToContinue':
      return {
        ...newState,
        isAllowanceStage: true,
      }
    case 'openWaitingForConfirmation':
    case 'openWaitingForApproval':
    case 'openInProgress':
    case 'openFailure':
    case 'openWaitToContinue':
      return {
        ...newState,
        isOpenStage: true,
      }
  }
}

function applyVaultCalculations(state: OpenVaultState): OpenVaultState {
  const {
    collateralBalance,
    depositAmount,
    maxDebtPerUnitCollateral,
    generateAmount,
    collateralPrice,
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(collateralPrice)
  const maxGenerateAmount = depositAmount ? depositAmount.times(maxDebtPerUnitCollateral) : zero
  const depositAmountUSD = depositAmount ? collateralPrice.times(depositAmount) : zero
  const generateAmountUSD = generateAmount ? generateAmount : zero // 1 DAI === 1 USD

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

function validate(state: OpenVaultState): OpenVaultState {
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

  // error
  if (depositAmount?.gt(maxDepositAmount)) {
    messages.push({ kind: 'depositAmountGreaterThanMaxDepositAmount' })
  }

  // error
  if (generateAmount?.lt(debtFloor)) {
    messages.push({ kind: 'generateAmountLessThanDebtFloor' })
  }

  // error
  if (generateAmount?.gt(ilkDebtAvailable)) {
    messages.push({ kind: 'generateAmountGreaterThanDebtCeiling' })
  }

  // error
  if (generateAmount?.gt(zero) && collateralizationRatio.lt(liquidationRatio)) {
    messages.push({ kind: 'vaultUnderCollateralized' })
  }

  // warning
  if (depositAmount?.gt(zero) && depositAmountUSD.lt(debtFloor)) {
    messages.push({ kind: 'potentialGenerateAmountLessThanDebtFloor' })
  }

  return { ...state, messages }
}

type OpenVaultChange = Changes<OpenVaultState>

export type ManualChange =
  | Change<OpenVaultState, 'depositAmount'>
  | Change<OpenVaultState, 'generateAmount'>

const apply: ApplyChange<OpenVaultState> = applyChange

type OpenVaultMessage = {
  kind:
    | 'depositAmountGreaterThanMaxDepositAmount'
    | 'generateAmountLessThanDebtFloor'
    | 'generateAmountGreaterThanDebtCeiling'
    | 'potentialGenerateAmountLessThanDebtFloor'
    | 'vaultUnderCollateralized'
}

export type OpenVaultStage =
  | 'ilkValidationLoading'
  | 'ilkValidationFailure'
  | 'ilkValidationSuccess'
  | 'editing'
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

export interface OpenVaultState {
  // Basic States
  stage: OpenVaultStage
  ilk: string
  messages: OpenVaultMessage[]
  account: string
  token: string

  // Dynamic States
  proxyAddress?: string
  allowance?: boolean
  progress?: () => void
  change?: (change: ManualChange) => void

  // Account Balance & Price Info
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  ethBalance: BigNumber
  ethPrice: BigNumber
  daiBalance: BigNumber

  // Vault Display Information
  liquidationPrice: BigNumber
  afterLiquidationPrice: BigNumber
  collateralizationRatio: BigNumber
  afterCollateralizationRatio: BigNumber
  lockedCollateral: BigNumber
  lockedCollateralUSD: BigNumber

  // Form Values
  depositAmount?: BigNumber
  generateAmount?: BigNumber

  // Form Bound Values
  maxDepositAmount: BigNumber
  maxGenerateAmount: BigNumber
  depositAmountUSD: BigNumber
  generateAmountUSD: BigNumber
  maxDepositAmountUSD: BigNumber

  // Ilk information
  maxDebtPerUnitCollateral: BigNumber // Updates
  ilkDebtAvailable: BigNumber // Updates
  debtFloor: BigNumber
  liquidationRatio: BigNumber

  // IsStage states
  isIlkValidationStage: boolean
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean
}

function addTransitions(
  context: ContextConnected,
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  allowance$: Observable<boolean>,
  change: (ch: OpenVaultChange) => void,
  state: OpenVaultState,
): OpenVaultState {
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

  if (state.stage === 'editing') {
    return {
      ...state,
      change,
      progress: !state.messages.length
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

export function createOpenVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<boolean>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilks$: Observable<string[]>,
  ilkToToken$: Observable<(ilk: string) => string>,
  ilk: string,
): Observable<OpenVaultState> {
  return ilks$
    .pipe(
      switchMap((ilks) => {
        const isValidIlk = ilks.some((i) => i === ilk)
        if (!isValidIlk) {
          return of({
            ilk,
            stage: 'ilkValidationFailure',
          })
        }
        return of({
          ilk,
          stage: 'ilkValidationSuccess',
        })
      }),
      startWith({ ilk, stage: 'ilkValidationLoading' }),
    )
    .pipe(
      switchMap((state) => {
        return iif(
          () => state.stage !== 'ilkValidationSuccess',
          of(state),
          combineLatest(context$, txHelpers$, ilkToToken$).pipe(
            switchMap(([context, txHelpers, ilkToToken]) => {
              const account = context.account
              const token = ilkToToken(ilk)

              const connectedProxyAddress$ = proxyAddress$(account)

              const connectedAllowance$ = connectedProxyAddress$.pipe(
                switchMap((proxyAddress) =>
                  proxyAddress ? allowance$(token, account, proxyAddress) : of(false),
                ),
              )
              const userTokenInfo$ = combineLatest(
                balance$(token, account),
                tokenOraclePrice$(token),
                balance$('ETH', account),
                tokenOraclePrice$('ETH'),
                balance$('DAI', account),
              ).pipe(
                switchMap(
                  ([collateralBalance, collateralPrice, ethBalance, ethPrice, daiBalance]) =>
                    of({
                      collateralBalance,
                      collateralPrice,
                      ethBalance,
                      ethPrice,
                      daiBalance,
                    }),
                ),
              )

              return combineLatest(
                userTokenInfo$,
                ilkData$(ilk),
                connectedProxyAddress$,
                connectedAllowance$,
              ).pipe(
                switchMap(
                  ([
                    { collateralBalance, collateralPrice, ethBalance, ethPrice, daiBalance },
                    { maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor, liquidationRatio },
                    proxyAddress,
                    allowance,
                  ]) => {
                    const initialState: OpenVaultState = {
                      ...defaultIsStates,
                      stage: 'editing',
                      token,
                      account,
                      collateralBalance,
                      collateralPrice,
                      ethBalance,
                      ethPrice,
                      daiBalance,
                      messages: [],
                      depositAmount: undefined,
                      generateAmount: undefined,
                      maxDepositAmount: zero,
                      maxGenerateAmount: zero,
                      depositAmountUSD: zero,
                      generateAmountUSD: zero,
                      maxDepositAmountUSD: zero,

                      liquidationPrice: zero,
                      afterLiquidationPrice: zero,
                      collateralizationRatio: zero,
                      afterCollateralizationRatio: zero,
                      lockedCollateral: zero,
                      lockedCollateralUSD: zero,

                      ilk,
                      maxDebtPerUnitCollateral,
                      ilkDebtAvailable,
                      debtFloor,
                      liquidationRatio,
                      proxyAddress,
                      allowance,
                    }

                    const change$ = new Subject<OpenVaultChange>()

                    function change(ch: OpenVaultChange) {
                      change$.next(ch)
                    }

                    const collateralBalanceChange$ = balance$(token, account!).pipe(
                      map((collateralBalance) => ({
                        kind: 'collateralBalance',
                        collateralBalance,
                      })),
                    )

                    const ethBalanceChange$ = balance$('ETH', account!).pipe(
                      map((ethBalance) => ({ kind: 'ethBalance', ethBalance })),
                    )

                    const daiBalanceChange$ = balance$('DAI', account!).pipe(
                      map((daiBalance) => ({ kind: 'daiBalance', daiBalance })),
                    )

                    const maxDebtPerUnitCollateralChange$ = ilkData$(ilk).pipe(
                      map(({ maxDebtPerUnitCollateral }) => ({
                        kind: 'maxDebtPerUnitCollateral',
                        maxDebtPerUnitCollateral,
                      })),
                    )

                    const ilkDebtAvailableChange$ = ilkData$(ilk).pipe(
                      map(({ ilkDebtAvailable }) => ({
                        kind: 'ilkDebtAvailable',
                        ilkDebtAvailable,
                      })),
                    )

                    const debtFloorChange$ = ilkData$(ilk).pipe(
                      map(({ debtFloor }) => ({
                        kind: 'debtFloor',
                        debtFloor,
                      })),
                    )

                    const collateralPriceChange$ = tokenOraclePrice$(ilk).pipe(
                      map((collateralPrice) => ({ kind: 'collateralPrice', collateralPrice })),
                    )

                    const environmentChanges$ = merge(
                      collateralPriceChange$,
                      collateralBalanceChange$,
                      ethBalanceChange$,
                      daiBalanceChange$,
                      maxDebtPerUnitCollateralChange$,
                      ilkDebtAvailableChange$,
                      debtFloorChange$,
                    )

                    return merge(change$, environmentChanges$).pipe(
                      scan(apply, initialState),
                      map(applyVaultCalculations),
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
                  },
                ),
              )
            }),
          ),
        )
      }),
      map(applyIsStageStates),
    )
}
