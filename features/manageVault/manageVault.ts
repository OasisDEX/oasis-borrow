import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { applyChange, ApplyChange, Change, Changes } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { first, distinctUntilChanged, map, switchMap, scan, shareReplay } from 'rxjs/operators'

const defaultIsStates = {
  isEditingStage: false,
  isProxyStage: false,
  isCollateralAllowanceStage: false,
  isDaiAllowanceStage: false,
  isTransactionStage: false,
}

function applyIsStageStates(state: ManageVaultState): ManageVaultState {
  const newState = {
    ...state,
    ...defaultIsStates,
  }

  switch (state.stage) {
    case 'editing':
      return {
        ...newState,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...newState,
        isProxyStage: true,
      }
    case 'collateralAllowanceWaitingForConfirmation':
    case 'collateralAllowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'collateralAllowanceFailure':
    case 'collateralAllowanceSuccess':
      return {
        ...newState,
        isCollateralAllowanceStage: true,
      }
    case 'daiAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceFailure':
    case 'daiAllowanceSuccess':
      return {
        ...newState,
        isDaiAllowanceStage: true,
      }

    case 'transactionWaitingForConfirmation':
    case 'transactionWaitingForApproval':
    case 'transactionInProgress':
    case 'transactionFailure':
    case 'transactionSuccess':
      return {
        ...newState,
        isTransactionStage: true,
      }
    default:
      return state
  }
}

function applyVaultCalculations(state: ManageVaultState): ManageVaultState {
  const {
    collateralBalance,
    depositAmount,
    maxDebtPerUnitCollateral,
    generateAmount,
    collateralPrice,
    liquidationRatio,
    depositAmountUSD,
    lockedCollateral,
    daiBalance,
    debt,
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(collateralPrice)

  const maxWithdrawAmount = lockedCollateral
  const maxWithdrawAmountUSD = lockedCollateral.times(collateralPrice)

  const maxGenerateAmount = depositAmount ? depositAmount.times(maxDebtPerUnitCollateral) : zero
  const generateAmountUSD = generateAmount || zero // 1 DAI === 1 USD

  const maxPaybackAmount = daiBalance.lt(debt) ? daiBalance : debt

  const afterCollateralizationRatio =
    depositAmountUSD && !generateAmountUSD.eq(zero) ? depositAmountUSD.div(generateAmountUSD) : zero

  const afterLiquidationPrice =
    generateAmount && depositAmount && depositAmount.gt(zero)
      ? generateAmount.times(liquidationRatio).div(depositAmount)
      : zero

  return {
    ...state,
    maxDepositAmount,
    maxGenerateAmount,
    maxWithdrawAmount,
    maxWithdrawAmountUSD,
    afterCollateralizationRatio,
    afterLiquidationPrice,
    generateAmountUSD,
    maxDepositAmountUSD,
    maxPaybackAmount,
  }
}

function validateErrors(state: ManageVaultState): ManageVaultState {
  // const {
  //   depositAmount,
  //   maxDepositAmount,
  //   generateAmount,
  //   allowanceAmount,
  //   debtFloor,
  //   ilkDebtAvailable,
  //   afterCollateralizationRatio,
  //   liquidationRatio,
  //   stage,
  // } = state

  // const errorMessages: OpenVaultErrorMessage[] = []

  // if (depositAmount?.gt(maxDepositAmount)) {
  //   errorMessages.push('depositAmountGreaterThanMaxDepositAmount')
  // }

  // if (generateAmount?.lt(debtFloor)) {
  //   errorMessages.push('generateAmountLessThanDebtFloor')
  // }

  // if (generateAmount?.gt(ilkDebtAvailable)) {
  //   errorMessages.push('generateAmountGreaterThanDebtCeiling')
  // }

  // if (stage === 'allowanceWaitingForConfirmation' || stage === 'allowanceFailure') {
  //   if (!allowanceAmount) {
  //     errorMessages.push('allowanceAmountEmpty')
  //   }
  //   if (allowanceAmount?.gt(maxUint256)) {
  //     errorMessages.push('customAllowanceAmountGreaterThanMaxUint256')
  //   }
  //   if (depositAmount && allowanceAmount && allowanceAmount.lt(depositAmount)) {
  //     errorMessages.push('customAllowanceAmountLessThanDepositAmount')
  //   }
  // }

  // if (generateAmount?.gt(zero) && afterCollateralizationRatio.lt(liquidationRatio)) {
  //   errorMessages.push('vaultUnderCollateralized')
  // }

  return { ...state }
}

function validateWarnings(state: ManageVaultState): ManageVaultState {
  // const {
  //   allowance,
  //   depositAmount,
  //   generateAmount,
  //   depositAmountUSD,
  //   debtFloor,
  //   proxyAddress,
  //   token,
  // } = state

  // const warningMessages: OpenVaultWarningMessage[] = []

  // if (depositAmount?.gt(zero) && depositAmountUSD.lt(debtFloor)) {
  //   warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
  // }

  // if (!proxyAddress) {
  //   warningMessages.push('noProxyAddress')
  // }

  // if (!depositAmount) {
  //   warningMessages.push('depositAmountEmpty')
  // }

  // if (!generateAmount) {
  //   warningMessages.push('generateAmountEmpty')
  // }

  // if (token !== 'ETH') {
  //   if (!allowance) {
  //     warningMessages.push('noAllowance')
  //   }
  //   if (depositAmount && allowance && depositAmount.gt(allowance)) {
  //     warningMessages.push('allowanceLessThanDepositAmount')
  //   }
  // }

  return { ...state }
}

type ManageVaultChange = Changes<ManageVaultState>

export type ManualChange =
  | Change<ManageVaultState, 'depositAmount'>
  | Change<ManageVaultState, 'depositAmountUSD'>
  | Change<ManageVaultState, 'withdrawAmount'>
  | Change<ManageVaultState, 'withdrawAmountUSD'>
  | Change<ManageVaultState, 'generateAmount'>
  | Change<ManageVaultState, 'generateAmountUSD'>
  | Change<ManageVaultState, 'paybackAmount'>
  | Change<ManageVaultState, 'collateralAllowanceAmount'>
  | Change<ManageVaultState, 'daiAllowanceAmount'>

const apply: ApplyChange<ManageVaultState> = applyChange

type ManageVaultErrorMessage =
  | 'depositAmountGreaterThanMaxDepositAmount'
  | 'withdrawAmountGreaterThanMaxWithdrawAmount'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountGreaterThanDebtCeiling'
  | 'paybackAmountGreaterThanMaxPaybackAmount'
  | 'paybackAmountLessThanDebtFloor'
  | 'vaultUnderCollateralized'
  | 'collateralAllowanceAmountEmpty'
  | 'customCollateralAllowanceAmountGreaterThanMaxUint256'
  | 'customCollateralAllowanceAmountLessThanDepositAmount'
  | 'daiAllowanceAmountEmpty'
  | 'customDaiAllowanceAmountGreaterThanMaxUint256'
  | 'customDaiAllowanceAmountLessThanDepositAmount'

type ManageVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'depositAmountEmpty'
  | 'withdrawAmountEmpty'
  | 'generateAmountEmpty'
  | 'paybackAmountEmpty'
  | 'noProxyAddress'
  | 'noCollateralAllowance'
  | 'noDaiAllowance'
  | 'collateralAllowanceLessThanDepositAmount'
  | 'daiAllowanceLessThanPaybackAmount'

export type ManageVaultStage =
  | 'editing'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxySuccess'
  | 'collateralAllowanceWaitingForConfirmation'
  | 'collateralAllowanceWaitingForApproval'
  | 'collateralAllowanceInProgress'
  | 'collateralAllowanceFailure'
  | 'collateralAllowanceSuccess'
  | 'daiAllowanceWaitingForConfirmation'
  | 'daiAllowanceWaitingForApproval'
  | 'daiAllowanceInProgress'
  | 'daiAllowanceFailure'
  | 'daiAllowanceSuccess'
  | 'transactionWaitingForConfirmation'
  | 'transactionWaitingForApproval'
  | 'transactionInProgress'
  | 'transactionFailure'
  | 'transactionSuccess'

export interface ManageVaultState {
  stage: ManageVaultStage
  id: BigNumber
  ilk: string
  token: string
  account: string

  // validation
  errorMessages: ManageVaultErrorMessage[]
  warningMessages: ManageVaultWarningMessage[]

  // IsStage states
  isEditingStage: boolean
  isProxyStage: boolean
  isCollateralAllowanceStage: boolean
  isDaiAllowanceStage: boolean
  isTransactionStage: boolean

  // Dynamic Data
  proxyAddress?: string
  progress?: () => void
  reset?: () => void
  change?: (change: ManualChange) => void

  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber

  collateralAllowanceAmount?: BigNumber
  daiAllowanceAmount?: BigNumber

  // Account Balance & Price Info
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  ethBalance: BigNumber
  ethPrice: BigNumber
  daiBalance: BigNumber

  // deposit
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber

  // withdraw
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  maxWithdrawAmount: BigNumber
  maxWithdrawAmountUSD: BigNumber

  // generate
  generateAmount?: BigNumber
  generateAmountUSD: BigNumber
  maxGenerateAmount: BigNumber

  // payback
  paybackAmount?: BigNumber
  maxPaybackAmount: BigNumber

  // Ilk information
  maxDebtPerUnitCollateral: BigNumber // Updates
  ilkDebtAvailable: BigNumber // Updates
  debtFloor: BigNumber
  liquidationRatio: BigNumber

  // Vault information
  lockedCollateral: BigNumber
  debt: BigNumber

  // Vault Display Information
  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber

  // TransactionInfo
  collateralAllowanceTxHash?: string
  daiAllowanceTxHash?: string
  proxyTxHash?: string
  openTxHash?: string
  proxyConfirmations?: number
  safeConfirmations: number
  txError?: any
  etherscan?: string
}

function addTransitions(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  collateralAllowance$: Observable<BigNumber>,
  daiAllowance$: Observable<BigNumber>,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
): ManageVaultState {
  function reset() {
    change({ kind: 'stage', stage: 'editing' })
    change({ kind: 'depositAmount', depositAmount: undefined })
    change({ kind: 'depositAmountUSD', depositAmountUSD: undefined })
    change({ kind: 'withdrawAmount', withdrawAmount: undefined })
    change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: undefined })
    change({ kind: 'generateAmount', generateAmount: undefined })
    change({ kind: 'paybackAmount', paybackAmount: undefined })
    change({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: maxUint256 })
    change({ kind: 'daiAllowanceAmount', daiAllowanceAmount: maxUint256 })
  }

  function progressEditing() {
    const canProgress = !state.errorMessages.length
    const hasProxy = !!state.proxyAddress

    const isDepositZero = state.depositAmount ? state.depositAmount.eq(zero) : true
    const isWithdrawZero = state.withdrawAmount ? state.withdrawAmount.eq(zero) : true
    const isGenerateZero = state.generateAmount ? state.generateAmount.eq(zero) : true
    const isPaybackZero = state.paybackAmount ? state.paybackAmount.eq(zero) : true

    const depositAmountLessThanCollateralAllowance =
      state.collateralAllowance &&
      state.depositAmount &&
      state.collateralAllowance.gte(state.depositAmount)

    const paybackAmountLessThanDaiAllowance =
      state.daiAllowance && state.paybackAmount && state.daiAllowance.gte(state.paybackAmount)

    // only needs collateral allowance to deposit
    const hasCollateralAllowance =
      state.token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero

    // only needs collateral allowance to deposit
    const hasDaiAllowance =
      state.token === 'ETH' ? true : paybackAmountLessThanDaiAllowance || isPaybackZero

    if (canProgress) {
      if (!hasProxy) {
        change({ kind: 'stage', stage: 'proxyWaitingForConfirmation' })
      } else if (!hasCollateralAllowance) {
        change({ kind: 'stage', stage: 'collateralAllowanceWaitingForConfirmation' })
      } else if (!hasDaiAllowance) {
        change({ kind: 'stage', stage: 'daiAllowanceWaitingForConfirmation' })
      } else change({ kind: 'stage', stage: 'transactionWaitingForConfirmation' })
    }
  }

  if (state.stage === 'editing') {
    return {
      ...state,
      change,
      reset,
      progress: progressEditing,
    }
  }

  // if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
  //   return {
  //     ...state,
  //     progress: () => createProxy(txHelpers, proxyAddress$, change, state),
  //   }
  // }

  // if (state.stage === 'proxySuccess') {
  //   return {
  //     ...state,
  //     progress: () =>
  //       change({
  //         kind: 'stage',
  //         stage: state.token === 'ETH' ? 'editing' : 'allowanceWaitingForConfirmation',
  //       }),
  //     reset: () => change({ kind: 'stage', stage: 'editing' }),
  //   }
  // }

  // if (state.stage === 'allowanceWaitingForConfirmation' || state.stage === 'allowanceFailure') {
  //   return {
  //     ...state,
  //     change,
  //     progress: () => setAllowance(txHelpers, allowance$, change, state),
  //     reset: () => change({ kind: 'stage', stage: 'editing' }),
  //   }
  // }

  // if (state.stage === 'allowanceSuccess') {
  //   return {
  //     ...state,
  //     progress: () =>
  //       change({
  //         kind: 'stage',
  //         stage: 'editing',
  //       }),
  //   }
  // }

  // if (state.stage === 'openWaitingForConfirmation' || state.stage === 'openFailure') {
  //   return {
  //     ...state,
  //     progress: () => openVault(txHelpers, change, state),
  //     reset: () => change({ kind: 'stage', stage: 'editing' }),
  //   }
  // }

  return state
}

export function createManageVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<ManageVaultState> {
  return combineLatest(context$, txHelpers$).pipe(
    switchMap(([context, txHelpers]) => {
      const account = context.account
      return vault$(id).pipe(
        first(),
        switchMap(({ token, ilk, lockedCollateral, debt }) => {
          const userTokenInfo$ = combineLatest(
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
          return combineLatest(userTokenInfo$, ilkData$(ilk), proxyAddress$(account)).pipe(
            first(),
            switchMap(
              ([
                { collateralBalance, collateralPrice, ethBalance, ethPrice, daiBalance },
                { maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor, liquidationRatio },
                proxyAddress,
              ]) => {
                const collateralAllowance$ =
                  (proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)
                const daiAllowance$ =
                  (proxyAddress && allowance$('DAI', account, proxyAddress)) || of(undefined)

                return combineLatest(collateralAllowance$, daiAllowance$).pipe(
                  first(),
                  switchMap(([collateralAllowance, daiAllowance]) => {
                    const initialState: ManageVaultState = {
                      ...defaultIsStates,
                      stage: 'editing',
                      token,
                      id,
                      account,
                      collateralBalance,
                      collateralPrice,
                      ethBalance,
                      ethPrice,
                      daiBalance,
                      errorMessages: [],
                      warningMessages: [],

                      depositAmount: undefined,
                      depositAmountUSD: undefined,
                      maxDepositAmount: zero,
                      maxDepositAmountUSD: zero,

                      withdrawAmount: undefined,
                      withdrawAmountUSD: undefined,
                      maxWithdrawAmount: zero,
                      maxWithdrawAmountUSD: zero,

                      generateAmount: undefined,
                      generateAmountUSD: zero,
                      maxGenerateAmount: zero,

                      paybackAmount: undefined,
                      maxPaybackAmount: zero,

                      lockedCollateral,
                      debt,

                      afterLiquidationPrice: zero,
                      afterCollateralizationRatio: zero,
                      ilk,
                      maxDebtPerUnitCollateral,
                      ilkDebtAvailable,
                      debtFloor,
                      liquidationRatio,
                      proxyAddress,
                      safeConfirmations: context.safeConfirmations,
                      etherscan: context.etherscan.url,

                      collateralAllowance,
                      daiAllowance,
                      collateralAllowanceAmount: maxUint256,
                      daiAllowanceAmount: maxUint256,
                    }

                    const change$ = new Subject<ManageVaultChange>()

                    function change(ch: ManageVaultChange) {
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

                    const lockedCollateralChange$ = vault$(id).pipe(
                      map(({ lockedCollateral }) => ({
                        kind: 'lockedCollateral',
                        lockedCollateral,
                      })),
                    )

                    const debt$ = vault$(id).pipe(
                      map(({ debt }) => ({
                        kind: 'debt',
                        debt,
                      })),
                    )

                    const environmentChanges$ = merge(
                      collateralPriceChange$,
                      collateralBalanceChange$,
                      ethBalanceChange$,
                      daiBalanceChange$,
                      maxDebtPerUnitCollateralChange$,
                      ilkDebtAvailableChange$,
                      debtFloorChange$,
                      lockedCollateralChange$,
                      debt$,
                    )

                    const connectedProxyAddress$ = proxyAddress$(account)

                    const connectedCollateralAllowance$ = connectedProxyAddress$.pipe(
                      switchMap((proxyAddress) =>
                        proxyAddress ? allowance$(token, account, proxyAddress) : of(zero),
                      ),
                      distinctUntilChanged((x, y) => x.eq(y)),
                    )
                    const connectedDaiAllowance$ = connectedProxyAddress$.pipe(
                      switchMap((proxyAddress) =>
                        proxyAddress ? allowance$('DAI', account, proxyAddress) : of(zero),
                      ),
                      distinctUntilChanged((x, y) => x.eq(y)),
                    )

                    return merge(change$, environmentChanges$).pipe(
                      scan(apply, initialState),
                      map(applyVaultCalculations),
                      map(validateErrors),
                      map(validateWarnings),
                      map(
                        curry(addTransitions)(
                          txHelpers,
                          connectedProxyAddress$,
                          connectedCollateralAllowance$,
                          connectedDaiAllowance$,
                          change,
                        ),
                      ),
                      shareReplay(1),
                    )
                  }),
                )
              },
            ),
          )
        }),
      )
    }),
    map(applyIsStageStates),
  )
}
