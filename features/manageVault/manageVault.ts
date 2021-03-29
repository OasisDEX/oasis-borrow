import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { createVaultChange$, Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { createUserTokenInfoChange$, UserTokenInfo } from 'features/shared/userTokenInfo'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { compose } from 'ramda'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { distinctUntilChanged, first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import {
  applyManageVaultAction,
  ManageVaultActionChange,
  ManageVaultActionKind,
} from './manageVaultActions'
import {
  applyManageVaultAllowance,
  ManageVaultAllowanceChange,
  ManageVaultAllowanceChangeKind,
} from './manageVaultAllowances'
import { applyManageVaultEnvironment, ManageVaultEnvironmentChange } from './manageVaultEnvironment'
import { applyManageVaultForm, ManageVaultFormChange, ManageVaultFormKind } from './manageVaultForm'
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
  ManageVaultTransitionKind,
  progressManage,
} from './manageVaultTransitions'
import {
  ManageVaultErrorMessage,
  ManageVaultWarningMessage,
  validateErrors,
  validateWarnings,
} from './manageVaultValidations'

const defaultIsStates = {
  isEditingStage: false,
  isProxyStage: false,
  isCollateralAllowanceStage: false,
  isDaiAllowanceStage: false,
  isManageStage: false,
}

function applyIsStageStates(state: ManageVaultState): ManageVaultState {
  const newState = {
    ...state,
    ...defaultIsStates,
  }

  switch (state.stage) {
    case 'collateralEditing':
    case 'daiEditing':
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

    case 'manageWaitingForConfirmation':
    case 'manageWaitingForApproval':
    case 'manageInProgress':
    case 'manageFailure':
    case 'manageSuccess':
      return {
        ...newState,
        isManageStage: true,
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
  const generateAmountUSD = generateAmount || zero // 1 DAI === 1 USD

  const maxPaybackAmount = daiBalance.lt(debt) ? daiBalance : debt

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
    generateAmountUSD,
    maxDepositAmountUSD,
    maxPaybackAmount,
  }
}

//export type ManageVaultGeneralisedChange = Changes<ManageVaultState>
export type ManageVaultChange =
  | ManageVaultActionChange
  | ManageVaultFormChange
  | ManageVaultAllowanceChange
  | ManageVaultTransitionChange
  | ManageVaultTransactionChange
  | ManageVaultEnvironmentChange

const curriedApplyManageVaultAction = curry(applyManageVaultAction)
const curriedApplyManageVaultForm = curry(applyManageVaultForm)
const curriedApplyManageVaultAllowance = curry(applyManageVaultAllowance)
const curriedApplyManageVaultTransition = curry(applyManageVaultTransition)
const curriedApplyManageVaultTransaction = curry(applyManageVaultTransaction)
const curriedApplyManageVaultEnvironment = curry(applyManageVaultEnvironment)

function apply(state: ManageVaultState, change: ManageVaultActionChange) {
  return compose(
    curriedApplyManageVaultAction(change),
    curriedApplyManageVaultForm(change),
    curriedApplyManageVaultAllowance(change),
    curriedApplyManageVaultTransition(change),
    curriedApplyManageVaultTransaction(change),
    curriedApplyManageVaultEnvironment(change),
  )(state)
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
  account: string
  accountIsController: boolean

  // validation
  errorMessages: ManageVaultErrorMessage[]
  warningMessages: ManageVaultWarningMessage[]

  isEditingStage: boolean
  isProxyStage: boolean
  isCollateralAllowanceStage: boolean
  isDaiAllowanceStage: boolean
  isManageStage: boolean

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
  generateAmountUSD: BigNumber
  maxGenerateAmount: BigNumber

  paybackAmount?: BigNumber
  maxPaybackAmount: BigNumber

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
  lockedCollateralPrice: BigNumber
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
}

export type ManageVaultState = DefaultManageVaultState & UserTokenInfo

function addTransitions(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  collateralAllowance$: Observable<BigNumber>,
  daiAllowance$: Observable<BigNumber>,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
): ManageVaultState {
  if (state.stage === 'collateralEditing' || state.stage === 'daiEditing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) =>
        change({ kind: ManageVaultActionKind.deposit, depositAmount }),
      updateDepositUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: ManageVaultActionKind.depositUSD, depositAmountUSD }),
      updateDepositMax: () => change({ kind: ManageVaultActionKind.depositMax }),
      updateGenerate: (generateAmount?: BigNumber) =>
        change({ kind: ManageVaultActionKind.generate, generateAmount }),
      updateGenerateMax: () => change({ kind: ManageVaultActionKind.generateMax }),
      updateWithdraw: (withdrawAmount?: BigNumber) =>
        change({ kind: ManageVaultActionKind.withdraw, withdrawAmount }),
      updateWithdrawUSD: (withdrawAmountUSD?: BigNumber) =>
        change({ kind: ManageVaultActionKind.withdrawUSD, withdrawAmountUSD }),
      updateWithdrawMax: () => change({ kind: ManageVaultActionKind.withdrawMax }),
      updatePayback: (paybackAmount?: BigNumber) =>
        change({ kind: ManageVaultActionKind.payback, paybackAmount }),
      updatePaybackMax: () => change({ kind: ManageVaultActionKind.paybackMax }),
      toggleDepositAndGenerateOption: () =>
        change({
          kind: ManageVaultFormKind.toggleDepositAndGenerateOption,
        }),
      togglePaybackAndWithdrawOption: () =>
        change({
          kind: ManageVaultFormKind.togglePaybackAndWithdrawOption,
        }),
      toggleIlkDetails: () => change({ kind: ManageVaultFormKind.toggleIlkDetails }),
      toggle: () => change({ kind: ManageVaultTransitionKind.toggleEditing }),
      progress: () => change({ kind: ManageVaultTransitionKind.progressEditing }),
    }
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers, proxyAddress$, change, state),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: () => change({ kind: ManageVaultTransitionKind.progressProxy }),
      reset: () => change({ kind: ManageVaultTransitionKind.backToEditing }),
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
          kind: ManageVaultAllowanceChangeKind.collateralAllowance,
          collateralAllowanceAmount,
        }),
      setCollateralAllowanceAmountUnlimited: () =>
        change({ kind: ManageVaultAllowanceChangeKind.collateralAllowanceUnlimited }),
      setCollateralAllowanceAmountToDepositAmount: () =>
        change({
          kind: ManageVaultAllowanceChangeKind.collateralAllowanceAsDepositAmount,
        }),
      resetCollateralAllowanceAmount: () =>
        change({
          kind: ManageVaultAllowanceChangeKind.collateralAllowance,
          collateralAllowanceAmount: undefined,
        }),

      progress: () => setCollateralAllowance(txHelpers, collateralAllowance$, change, state),
      reset: () => change({ kind: ManageVaultTransitionKind.backToEditing }),
    }
  }

  if (state.stage === 'collateralAllowanceSuccess') {
    return {
      ...state,
      progress: () => change({ kind: ManageVaultTransitionKind.progressCollateralAllowance }),
    }
  }

  if (
    state.stage === 'daiAllowanceWaitingForConfirmation' ||
    state.stage === 'daiAllowanceFailure'
  ) {
    return {
      ...state,
      updateDaiAllowanceAmount: (daiAllowanceAmount?: BigNumber) =>
        change({ kind: ManageVaultAllowanceChangeKind.daiAllowance, daiAllowanceAmount }),
      setDaiAllowanceAmountUnlimited: () =>
        change({ kind: ManageVaultAllowanceChangeKind.collateralAllowanceUnlimited }),
      setDaiAllowanceAmountToPaybackAmount: () =>
        change({ kind: ManageVaultAllowanceChangeKind.daiAllowanceAsPaybackAmount }),
      resetDaiAllowanceAmount: () =>
        change({
          kind: ManageVaultAllowanceChangeKind.daiAllowance,
          daiAllowanceAmount: undefined,
        }),

      progress: () => setDaiAllowance(txHelpers, daiAllowance$, change, state),
      reset: () => change({ kind: ManageVaultTransitionKind.backToEditing }),
    }
  }

  if (state.stage === 'daiAllowanceSuccess') {
    return {
      ...state,
      progress: () => change({ kind: ManageVaultTransitionKind.backToEditing }),
    }
  }

  if (state.stage === 'manageWaitingForConfirmation' || state.stage === 'manageFailure') {
    return {
      ...state,
      progress: () => progressManage(txHelpers, state, change),
      reset: () => change({ kind: ManageVaultTransitionKind.backToEditing }),
    }
  }

  if (state.stage === 'manageSuccess') {
    return {
      ...state,
      progress: () => change({ kind: ManageVaultTransitionKind.resetToEditing }),
    }
  }

  return state
}

export const defaultManageVaultState: DefaultManageVaultState = {
  ...defaultIsStates,
  stage: 'collateralEditing',
  originalEditingStage: 'collateralEditing',
  token: '',
  id: zero,
  ilk: '',
  account: '',
  accountIsController: false,
  errorMessages: [],
  warningMessages: [],
  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,
  maxWithdrawAmount: zero,
  maxWithdrawAmountUSD: zero,
  generateAmountUSD: zero,
  maxGenerateAmount: zero,
  maxPaybackAmount: zero,
  lockedCollateral: zero,
  lockedCollateralPrice: zero,
  debt: zero,
  liquidationPrice: zero,
  collateralizationRatio: zero,
  freeCollateral: zero,
  afterLiquidationPrice: zero,
  afterCollateralizationRatio: zero,
  maxDebtPerUnitCollateral: zero,
  ilkDebtAvailable: zero,
  stabilityFee: zero,
  liquidationPenalty: zero,
  debtFloor: zero,
  liquidationRatio: zero,
  safeConfirmations: 0,
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
  showDepositAndGenerateOption: false,
  showPaybackAndWithdrawOption: false,
  showIlkDetails: false,
}

export function createManageVault$(
  // TODO: replace defaultManageVaultState with custom change
  defaultState$: Observable<DefaultManageVaultState>,
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  userTokenInfo$: (token: string, account: string) => Observable<UserTokenInfo>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<ManageVaultState> {
  return combineLatest(context$, txHelpers$).pipe(
    switchMap(([context, txHelpers]) => {
      const account = context.account
      return vault$(id).pipe(
        first(),
        switchMap((vault) => {
          return combineLatest(
            defaultState$,
            userTokenInfo$(vault.token, account),
            ilkData$(vault.ilk),
            proxyAddress$(account),
          ).pipe(
            first(),
            switchMap(([defaultState, userTokenInfo, ilkData, proxyAddress]) => {
              const collateralAllowance$ =
                (proxyAddress && allowance$(vault.token, account, proxyAddress)) || of(undefined)
              const daiAllowance$ =
                (proxyAddress && allowance$('DAI', account, proxyAddress)) || of(undefined)

              return combineLatest(collateralAllowance$, daiAllowance$).pipe(
                first(),
                switchMap(([collateralAllowance, daiAllowance]) => {
                  vault.token
                  const initialState: ManageVaultState = {
                    ...userTokenInfo,
                    ...defaultState,
                    token: vault.token,
                    id,
                    account,
                    accountIsController: account === vault.controller,

                    lockedCollateral: vault.lockedCollateral,
                    lockedCollateralPrice: vault.lockedCollateralPrice,
                    debt: vault.debt,
                    liquidationPrice: vault.liquidationPrice,
                    collateralizationRatio: vault.collateralizationRatio,
                    freeCollateral: vault.freeCollateral,
                    liquidationPenalty: ilkData.liquidationPenalty,
                    ilk: vault.ilk,
                    maxDebtPerUnitCollateral: ilkData.maxDebtPerUnitCollateral,
                    ilkDebtAvailable: ilkData.ilkDebtAvailable,
                    debtFloor: ilkData.debtFloor,
                    stabilityFee: ilkData.stabilityFee,
                    liquidationRatio: ilkData.liquidationRatio,
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

                  const userTokenInfoChange$ = curry(createUserTokenInfoChange$)(userTokenInfo$)
                  const ilkDataChange$ = curry(createIlkDataChange$)(ilkData$)
                  const vaultChange$ = curry(createVaultChange$)(vault$)

                  const environmentChanges$ = merge(
                    userTokenInfoChange$(vault.token, account),
                    ilkDataChange$(vault.ilk),
                    vaultChange$(id),
                  )

                  const connectedProxyAddress$ = proxyAddress$(account)

                  const connectedCollateralAllowance$ = connectedProxyAddress$.pipe(
                    switchMap((proxyAddress) =>
                      proxyAddress ? allowance$(vault.token, account, proxyAddress) : of(zero),
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
            }),
          )
        }),
      )
    }),
    map(applyIsStageStates),
  )
}
