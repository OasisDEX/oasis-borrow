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
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(collateralPrice)

  const maxWithdrawAmount = lockedCollateral
  const maxWithdrawAmountUSD = lockedCollateral.times(collateralPrice)

  const maxGenerateAmount = depositAmount ? depositAmount.times(maxDebtPerUnitCollateral) : zero
  const generateAmountUSD = generateAmount || zero // 1 DAI === 1 USD

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
  | Change<ManageVaultState, 'paybackAmountUSD'>
  | Change<ManageVaultState, 'collateralAllowanceAmount'>
  | Change<ManageVaultState, 'daiAllowanceAmount'>

const apply: ApplyChange<ManageVaultState> = applyChange

type ManageVaultErrorMessage =
  | 'depositAmountGreaterThanMaxDepositAmount'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountGreaterThanDebtCeiling'
  | 'vaultUnderCollateralized'
  | 'allowanceAmountEmpty'
  | 'customAllowanceAmountGreaterThanMaxUint256'
  | 'customAllowanceAmountLessThanDepositAmount'

type ManageVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'depositAmountEmpty'
  | 'generateAmountEmpty'
  | 'noProxyAddress'
  | 'noAllowance'
  | 'allowanceLessThanDepositAmount'

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
  allowance?: BigNumber
  progress?: () => void
  reset?: () => void
  change?: (change: ManualChange) => void

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
  generateAmountUSD?: BigNumber
  maxGenerateAmount: BigNumber
  maxGenerateAmountUSD: BigNumber

  // payback
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
  maxPaybackAmount: BigNumber
  maxPaybackAmountUSD: BigNumber

  // Ilk information
  maxDebtPerUnitCollateral: BigNumber // Updates
  ilkDebtAvailable: BigNumber // Updates
  debtFloor: BigNumber
  liquidationRatio: BigNumber

  // Vault information
  lockedCollateral: BigNumber

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
  allowance$: Observable<BigNumber>,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
): ManageVaultState {
  // function backToOpenVaultModalEditing() {
  //   change({ kind: 'stage', stage: 'editing' })
  // }

  function reset() {
    change({ kind: 'stage', stage: 'editing' })
    change({ kind: 'depositAmount', depositAmount: undefined })
    change({ kind: 'depositAmountUSD', depositAmountUSD: undefined })
    change({ kind: 'withdrawAmount', withdrawAmount: undefined })
    change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: undefined })
    change({ kind: 'generateAmount', generateAmount: undefined })
    change({ kind: 'generateAmountUSD', generateAmountUSD: undefined })
    change({ kind: 'paybackAmount', paybackAmount: undefined })
    change({ kind: 'paybackAmountUSD', paybackAmountUSD: undefined })
    change({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: maxUint256 })
    change({ kind: 'daiAllowanceAmount', daiAllowanceAmount: maxUint256 })
  }

  // function progressEditing() {
  //   const canProgress = !state.errorMessages.length
  //   const hasProxy = !!state.proxyAddress

  //   const openingEmptyVault = state.depositAmount ? state.depositAmount.eq(zero) : true
  //   const depositAmountLessThanAllowance =
  //     state.allowance && state.depositAmount && state.allowance.gte(state.depositAmount)

  //   const hasAllowance =
  //     state.token === 'ETH' ? true : depositAmountLessThanAllowance || openingEmptyVault

  //   if (canProgress) {
  //     if (!hasProxy) {
  //       change({ kind: 'stage', stage: 'proxyWaitingForConfirmation' })
  //     } else if (!hasAllowance) {
  //       change({ kind: 'stage', stage: 'allowanceWaitingForConfirmation' })
  //     } else change({ kind: 'stage', stage: 'openWaitingForConfirmation' })
  //   }
  // }

  if (state.stage === 'editing') {
    return {
      ...state,
      change,
      reset,
      progress: () => null, //progressEditing,
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
        switchMap(({ token, ilk, lockedCollateral }) => {
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
              ]) =>
                ((proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)).pipe(
                  first(),
                  switchMap((allowance) => {
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
                      generateAmountUSD: undefined,
                      maxGenerateAmount: zero,
                      maxGenerateAmountUSD: zero,

                      paybackAmount: undefined,
                      paybackAmountUSD: undefined,
                      maxPaybackAmount: zero,
                      maxPaybackAmountUSD: zero,

                      lockedCollateral,

                      afterLiquidationPrice: zero,
                      afterCollateralizationRatio: zero,
                      ilk,
                      maxDebtPerUnitCollateral,
                      ilkDebtAvailable,
                      debtFloor,
                      liquidationRatio,
                      proxyAddress,
                      allowance,
                      safeConfirmations: context.safeConfirmations,
                      etherscan: context.etherscan.url,
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

                    const environmentChanges$ = merge(
                      collateralPriceChange$,
                      collateralBalanceChange$,
                      ethBalanceChange$,
                      daiBalanceChange$,
                      maxDebtPerUnitCollateralChange$,
                      ilkDebtAvailableChange$,
                      debtFloorChange$,
                      lockedCollateralChange$,
                    )

                    const connectedProxyAddress$ = proxyAddress$(account)

                    const connectedAllowance$ = connectedProxyAddress$.pipe(
                      switchMap((proxyAddress) =>
                        proxyAddress ? allowance$(token, account, proxyAddress) : of(zero),
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
        }),
      )
    }),
    map(applyIsStageStates),
  )
}
