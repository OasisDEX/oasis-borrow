import { BigNumber } from 'bignumber.js'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { createVaultChange$, Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { one, zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { distinctUntilChanged, first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import { BalanceInfo, balanceInfoChange$ } from '../shared/balanceInfo'
import { applyManageVaultAllowance, ManageVaultAllowanceChange } from './manageVaultAllowances'
import { applyManageVaultEnvironment, ManageVaultEnvironmentChange } from './manageVaultEnvironment'
import { applyManageVaultForm, ManageVaultFormChange } from './manageVaultForm'
import { applyManageVaultInput, ManageVaultInputChange } from './manageVaultInput'
import {
  applyManageVaultTransaction,
  createProxy,
  ManageVaultTransactionChange,
  setCollateralAllowance,
  setDaiAllowance,
} from './manageVaultTransactions'
import {
  applyManageVaultTransition,
  ManageVaultTransitionChange,
  progressManage,
} from './manageVaultTransitions'
import {
  ManageVaultErrorMessage,
  ManageVaultWarningMessage,
  validateErrors,
  validateWarnings,
} from './manageVaultValidations'

const defaultManageVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isCollateralAllowanceStage: false,
  isDaiAllowanceStage: false,
  isManageStage: false,
}

export function categoriseManageVaultStage(stage: ManageVaultStage) {
  switch (stage) {
    case 'collateralEditing':
    case 'daiEditing':
      return {
        ...defaultManageVaultStageCategories,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...defaultManageVaultStageCategories,
        isProxyStage: true,
      }
    case 'collateralAllowanceWaitingForConfirmation':
    case 'collateralAllowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'collateralAllowanceFailure':
    case 'collateralAllowanceSuccess':
      return {
        ...defaultManageVaultStageCategories,
        isCollateralAllowanceStage: true,
      }
    case 'daiAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceFailure':
    case 'daiAllowanceSuccess':
      return {
        ...defaultManageVaultStageCategories,
        isDaiAllowanceStage: true,
      }

    case 'manageWaitingForConfirmation':
    case 'manageWaitingForApproval':
    case 'manageInProgress':
    case 'manageFailure':
    case 'manageSuccess':
      return {
        ...defaultManageVaultStageCategories,
        isManageStage: true,
      }
    default:
      return defaultManageVaultStageCategories
  }
}

export const PAYBACK_ALL_BOUND = one

export function applyManageVaultCalculations(state: ManageVaultState): ManageVaultState {
  const {
    collateralBalance,
    depositAmount,
    maxDebtPerUnitCollateral,
    generateAmount,
    currentCollateralPrice,
    liquidationRatio,
    freeCollateral,
    lockedCollateral,
    daiBalance,
    withdrawAmount,
    paybackAmount,
    debt,
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const maxWithdrawAmount = freeCollateral
  const maxWithdrawAmountUSD = freeCollateral.times(currentCollateralPrice)

  const maxGenerateAmount = lockedCollateral
    .plus(depositAmount || zero)
    .times(maxDebtPerUnitCollateral)
    .minus(debt)

  // NOTE Important
  const roundedDebt = debt.dp(6, BigNumber.ROUND_HALF_UP)

  const maxPaybackAmount = daiBalance.lt(roundedDebt) ? daiBalance : roundedDebt

  const shouldPaybackAll = !!(
    daiBalance.gte(debt) &&
    paybackAmount &&
    paybackAmount.plus(PAYBACK_ALL_BOUND).gte(roundedDebt) &&
    !paybackAmount.gt(roundedDebt)
  )

  const afterLockedCollateral = depositAmount
    ? lockedCollateral.plus(depositAmount)
    : withdrawAmount
    ? lockedCollateral.minus(withdrawAmount)
    : lockedCollateral

  const afterLockedCollateralUSD = afterLockedCollateral.times(currentCollateralPrice)
  const afterDebt = generateAmount
    ? debt.plus(generateAmount)
    : paybackAmount
    ? debt.minus(paybackAmount)
    : debt

  const afterCollateralizationRatio =
    afterLockedCollateralUSD.gt(zero) && afterDebt.gt(zero)
      ? afterLockedCollateralUSD.div(afterDebt)
      : zero

  const afterLiquidationPrice =
    generateAmount && depositAmount && depositAmount.gt(zero)
      ? afterDebt.times(liquidationRatio).div(afterLockedCollateral)
      : zero

  return {
    ...state,
    maxDepositAmount,
    maxGenerateAmount,
    maxWithdrawAmount,
    maxWithdrawAmountUSD,
    afterCollateralizationRatio,
    afterLiquidationPrice,
    maxDepositAmountUSD,
    maxPaybackAmount,
    shouldPaybackAll,
  }
}

interface ManageVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<ManageVaultState>
}

function applyManageVaultInjectedOverride(change: ManageVaultChange, state: ManageVaultState) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

export type ManageVaultChange =
  | ManageVaultInputChange
  | ManageVaultFormChange
  | ManageVaultAllowanceChange
  | ManageVaultTransitionChange
  | ManageVaultTransactionChange
  | ManageVaultEnvironmentChange
  | ManageVaultInjectedOverrideChange

function apply(state: ManageVaultState, change: ManageVaultChange) {
  const s1 = applyManageVaultInput(change, state)
  const s2 = applyManageVaultForm(change, s1)
  const s3 = applyManageVaultAllowance(change, s2)
  const s4 = applyManageVaultTransition(change, s3)
  const s5 = applyManageVaultTransaction(change, s4)
  const s6 = applyManageVaultEnvironment(change, s5)
  const s7 = applyManageVaultInjectedOverride(change, s6)
  return applyManageVaultCalculations(s7)
}

export type ManageVaultEditingStage = 'collateralEditing' | 'daiEditing'

export type ManageVaultStage =
  | ManageVaultEditingStage
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
  | 'manageWaitingForConfirmation'
  | 'manageWaitingForApproval'
  | 'manageInProgress'
  | 'manageFailure'
  | 'manageSuccess'

export type DefaultManageVaultState = {
  stage: ManageVaultStage
  originalEditingStage: ManageVaultEditingStage
  id: BigNumber
  ilk: string
  token: string
  account: string | undefined
  accountIsController: boolean

  // validation
  errorMessages: ManageVaultErrorMessage[]
  warningMessages: ManageVaultWarningMessage[]

  progress?: () => void
  reset?: () => void
  toggle?: () => void

  showIlkDetails: Boolean
  toggleIlkDetails?: () => void

  showDepositAndGenerateOption: Boolean
  showPaybackAndWithdrawOption: Boolean
  toggleDepositAndGenerateOption?: () => void
  togglePaybackAndWithdrawOption?: () => void

  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber

  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  maxWithdrawAmount: BigNumber
  maxWithdrawAmountUSD: BigNumber

  generateAmount?: BigNumber
  maxGenerateAmount: BigNumber

  paybackAmount?: BigNumber
  maxPaybackAmount: BigNumber
  shouldPaybackAll: boolean

  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositUSD?: (depositAmount?: BigNumber) => void
  updateDepositMax?: () => void
  updateGenerate?: (generateAmount?: BigNumber) => void
  updateGenerateMax?: () => void
  updateWithdraw?: (withdrawAmount?: BigNumber) => void
  updateWithdrawUSD?: (withdrawAmount?: BigNumber) => void
  updateWithdrawMax?: () => void
  updatePayback?: (paybackAmount?: BigNumber) => void
  updatePaybackMax?: () => void

  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber

  collateralAllowanceAmount?: BigNumber
  updateCollateralAllowanceAmount?: (amount?: BigNumber) => void
  setCollateralAllowanceAmountUnlimited?: (amount?: BigNumber) => void
  setCollateralAllowanceAmountToDepositAmount?: (amount?: BigNumber) => void
  resetCollateralAllowanceAmount?: () => void

  daiAllowanceAmount?: BigNumber
  updateDaiAllowanceAmount?: (amount?: BigNumber) => void
  setDaiAllowanceAmountUnlimited?: (amount?: BigNumber) => void
  setDaiAllowanceAmountToPaybackAmount?: (amount?: BigNumber) => void
  resetDaiAllowanceAmount?: () => void

  maxDebtPerUnitCollateral: BigNumber
  ilkDebtAvailable: BigNumber
  debtFloor: BigNumber
  liquidationRatio: BigNumber
  stabilityFee: BigNumber
  liquidationPenalty: BigNumber

  lockedCollateral: BigNumber
  lockedCollateralUSD: BigNumber
  debt: BigNumber
  liquidationPrice: BigNumber
  collateralizationRatio: BigNumber
  freeCollateral: BigNumber

  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber

  collateralAllowanceTxHash?: string
  daiAllowanceTxHash?: string
  proxyTxHash?: string
  manageTxHash?: string
  proxyConfirmations?: number
  safeConfirmations: number
  txError?: any
  etherscan?: string

  injectStateOverride: (state: Partial<ManageVaultState>) => void
}

export type ManageVaultState = DefaultManageVaultState & PriceInfo & BalanceInfo

function addTransitions(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  collateralAllowance$: Observable<BigNumber>,
  daiAllowance$: Observable<BigNumber>,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
): ManageVaultState {
  if (state.stage === 'collateralEditing' || state.stage === 'daiEditing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) => change({ kind: 'deposit', depositAmount }),
      updateDepositUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: 'depositUSD', depositAmountUSD }),
      updateDepositMax: () => change({ kind: 'depositMax' }),
      updateGenerate: (generateAmount?: BigNumber) => change({ kind: 'generate', generateAmount }),
      updateGenerateMax: () => change({ kind: 'generateMax' }),
      updateWithdraw: (withdrawAmount?: BigNumber) => change({ kind: 'withdraw', withdrawAmount }),
      updateWithdrawUSD: (withdrawAmountUSD?: BigNumber) =>
        change({ kind: 'withdrawUSD', withdrawAmountUSD }),
      updateWithdrawMax: () => change({ kind: 'withdrawMax' }),
      updatePayback: (paybackAmount?: BigNumber) => change({ kind: 'payback', paybackAmount }),
      updatePaybackMax: () => change({ kind: 'paybackMax' }),
      toggleDepositAndGenerateOption: () =>
        change({
          kind: 'toggleDepositAndGenerateOption',
        }),
      togglePaybackAndWithdrawOption: () =>
        change({
          kind: 'togglePaybackAndWithdrawOption',
        }),
      toggleIlkDetails: () => change({ kind: 'toggleIlkDetails' }),
      toggle: () => change({ kind: 'toggleEditing' }),
      progress: () => change({ kind: 'progressEditing' }),
    }
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers$, proxyAddress$, change, state),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'progressProxy' }),
      reset: () => change({ kind: 'backToEditing' }),
    }
  }

  if (
    state.stage === 'collateralAllowanceWaitingForConfirmation' ||
    state.stage === 'collateralAllowanceFailure'
  ) {
    return {
      ...state,
      updateCollateralAllowanceAmount: (collateralAllowanceAmount?: BigNumber) =>
        change({
          kind: 'collateralAllowance',
          collateralAllowanceAmount,
        }),
      setCollateralAllowanceAmountUnlimited: () => change({ kind: 'collateralAllowanceUnlimited' }),
      setCollateralAllowanceAmountToDepositAmount: () =>
        change({
          kind: 'collateralAllowanceAsDepositAmount',
        }),
      resetCollateralAllowanceAmount: () =>
        change({
          kind: 'collateralAllowance',
          collateralAllowanceAmount: undefined,
        }),

      progress: () => setCollateralAllowance(txHelpers$, collateralAllowance$, change, state),
      reset: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'collateralAllowanceSuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'progressCollateralAllowance' }),
    }
  }

  if (
    state.stage === 'daiAllowanceWaitingForConfirmation' ||
    state.stage === 'daiAllowanceFailure'
  ) {
    return {
      ...state,
      updateDaiAllowanceAmount: (daiAllowanceAmount?: BigNumber) =>
        change({ kind: 'daiAllowance', daiAllowanceAmount }),
      setDaiAllowanceAmountUnlimited: () => change({ kind: 'collateralAllowanceUnlimited' }),
      setDaiAllowanceAmountToPaybackAmount: () => change({ kind: 'daiAllowanceAsPaybackAmount' }),
      resetDaiAllowanceAmount: () =>
        change({
          kind: 'daiAllowance',
          daiAllowanceAmount: undefined,
        }),

      progress: () => setDaiAllowance(txHelpers$, daiAllowance$, change, state),
      reset: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'daiAllowanceSuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'manageWaitingForConfirmation' || state.stage === 'manageFailure') {
    return {
      ...state,
      progress: () => progressManage(txHelpers$, state, change),
      reset: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'manageSuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'resetToEditing' }),
    }
  }

  return state
}

export const defaultPartialManageVaultState = {
  stage: 'collateralEditing' as ManageVaultStage,
  originalEditingStage: 'collateralEditing' as ManageVaultEditingStage,
  errorMessages: [],
  warningMessages: [],
  showIlkDetails: false,
  showDepositAndGenerateOption: false,
  showPaybackAndWithdrawOption: false,
  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,
  maxGenerateAmount: zero,
  maxWithdrawAmount: zero,
  maxWithdrawAmountUSD: zero,
  maxPaybackAmount: zero,
  afterCollateralizationRatio: zero,
  afterLiquidationPrice: zero,
  shouldPaybackAll: false,
}

export function createManageVault$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<ManageVaultState> {
  return context$.pipe(
    switchMap((context) => {
      const account = context.status === 'connected' ? context.account : undefined
      return vault$(id).pipe(
        first(),
        switchMap((vault) => {
          return combineLatest(
            priceInfo$(vault.token),
            balanceInfo$(vault.token, account),
            ilkData$(vault.ilk),
            account ? proxyAddress$(account) : of(undefined),
          ).pipe(
            first(),
            switchMap(([priceInfo, balanceInfo, ilkData, proxyAddress]) => {
              const collateralAllowance$ =
                account && proxyAddress
                  ? allowance$(vault.token, account, proxyAddress)
                  : of(undefined)
              const daiAllowance$ =
                account && proxyAddress ? allowance$('DAI', account, proxyAddress) : of(undefined)

              return combineLatest(collateralAllowance$, daiAllowance$).pipe(
                first(),
                switchMap(([collateralAllowance, daiAllowance]) => {
                  const change$ = new Subject<ManageVaultChange>()

                  function change(ch: ManageVaultChange) {
                    change$.next(ch)
                  }

                  // NOTE: Not to be used in production/dev, test only
                  function injectStateOverride(stateToOverride: Partial<ManageVaultState>) {
                    return change$.next({ kind: 'injectStateOverride', stateToOverride })
                  }

                  const initialState: ManageVaultState = {
                    ...priceInfo,
                    ...balanceInfo,
                    ...defaultPartialManageVaultState,
                    ...ilkData,
                    stage: 'collateralEditing',
                    originalEditingStage: 'collateralEditing',
                    id,
                    account,
                    proxyAddress,
                    collateralAllowance,
                    daiAllowance,
                    accountIsController: account === vault.controller,
                    token: vault.token,
                    lockedCollateral: vault.lockedCollateral,
                    lockedCollateralUSD: vault.lockedCollateralUSD,
                    debt: vault.debt,
                    liquidationPrice: vault.liquidationPrice,
                    collateralizationRatio: vault.collateralizationRatio,
                    freeCollateral: vault.freeCollateral,
                    ilk: vault.ilk,
                    safeConfirmations: context.safeConfirmations,
                    etherscan: context.etherscan.url,
                    injectStateOverride,
                  }

                  const environmentChanges$ = merge(
                    priceInfoChange$(priceInfo$, vault.token),
                    balanceInfoChange$(balanceInfo$, vault.token, account),
                    createIlkDataChange$(ilkData$, vault.ilk),
                    createVaultChange$(vault$, id),
                  )

                  const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                  const connectedCollateralAllowance$ = connectedProxyAddress$.pipe(
                    switchMap((proxyAddress) =>
                      account && proxyAddress
                        ? allowance$(vault.token, account, proxyAddress)
                        : of(zero),
                    ),
                    distinctUntilChanged((x, y) => x.eq(y)),
                  )

                  const connectedDaiAllowance$ = connectedProxyAddress$.pipe(
                    switchMap((proxyAddress) =>
                      account && proxyAddress ? allowance$('DAI', account, proxyAddress) : of(zero),
                    ),
                    distinctUntilChanged((x, y) => x.eq(y)),
                  )

                  return merge(change$, environmentChanges$).pipe(
                    scan(apply, initialState),
                    map(validateErrors),
                    map(validateWarnings),
                    map(
                      curry(addTransitions)(
                        txHelpers$,
                        connectedProxyAddress$,
                        connectedCollateralAllowance$,
                        connectedDaiAllowance$,
                        change,
                      ),
                    ),
                  )
                }),
              )
            }),
          )
        }),
      )
    }),
    shareReplay(1),
  )
}
