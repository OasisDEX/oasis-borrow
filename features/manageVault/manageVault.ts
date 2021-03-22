import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData, maxUint256 } from 'blockchain/calls/erc20'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import {
  depositAndGenerate,
  DepositAndGenerateData,
  withdrawAndPayback,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { createUserTokenInfoChange$, UserTokenInfo } from 'features/shared/userTokenInfo'
import { ApplyChange, applyChange, Changes, transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, iif, merge, Observable, of, Subject } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  scan,
  shareReplay,
  switchMap,
} from 'rxjs/operators'
import {
  actionDeposit,
  actionDepositMax,
  actionDepositUSD,
  actionGenerate,
  actionGenerateMax,
  actionPayback,
  actionPaybackMax,
  actionWithdraw,
  actionWithdrawMax,
  actionWithdrawUSD,
  clearDepositAndGenerate,
  clearPaybackAndWithdraw,
} from './manageVaultEditingActions'
import { createProxy, setCollateralAllowance, setDaiAllowance } from './manageVaultTransactions'
import {
  progressCollateralAllowance,
  progressEditing,
  progressManage,
  progressProxy,
  resetBackToEditingStage,
  toggleEditing,
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

export type ManageVaultChange = Changes<ManageVaultState>

const apply: ApplyChange<ManageVaultState> = applyChange

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

  // IsStage states
  isEditingStage: boolean
  isProxyStage: boolean
  isCollateralAllowanceStage: boolean
  isDaiAllowanceStage: boolean
  isManageStage: boolean

  // Dynamic Data
  proxyAddress?: string
  progress?: () => void
  reset?: () => void
  toggle?: () => void

  showDepositAndGenerateOption: Boolean
  showPaybackAndWithdrawOption: Boolean
  toggleDepositAndGenerateOption?: () => void
  togglePaybackAndWithdrawOption?: () => void

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

  // Ilk information
  maxDebtPerUnitCollateral: BigNumber // Updates
  ilkDebtAvailable: BigNumber // Updates
  debtFloor: BigNumber
  liquidationRatio: BigNumber
  stabilityFee: BigNumber
  liquidationPenalty: BigNumber

  // Vault information
  lockedCollateral: BigNumber
  lockedCollateralPrice: BigNumber
  debt: BigNumber
  liquidationPrice: BigNumber
  collateralizationRatio: BigNumber
  freeCollateral: BigNumber

  // Vault Display Information
  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber

  // ManageInfo
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

export function resetAllowances(change: (ch: ManageVaultChange) => void) {
  change({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: maxUint256 })
  change({ kind: 'daiAllowanceAmount', daiAllowanceAmount: maxUint256 })
}

export function resetDefaults(change: (ch: ManageVaultChange) => void) {
  change({ kind: 'showDepositAndGenerateOption', showDepositAndGenerateOption: false })
  change({ kind: 'showPaybackAndWithdrawOption', showPaybackAndWithdrawOption: false })
  clearDepositAndGenerate(change)
  clearPaybackAndWithdraw(change)
  resetAllowances(change)
}

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
      updateDeposit: (amount?: BigNumber) => actionDeposit(state, change, amount),
      updateDepositUSD: (amount?: BigNumber) => actionDepositUSD(state, change, amount),
      updateDepositMax: () => actionDepositMax(state, change),
      updateGenerate: (amount?: BigNumber) => actionGenerate(state, change, amount),
      updateGenerateMax: () => actionGenerateMax(state, change),
      updateWithdraw: (amount?: BigNumber) => actionWithdraw(state, change, amount),
      updateWithdrawUSD: (amount?: BigNumber) => actionWithdrawUSD(state, change, amount),
      updateWithdrawMax: () => actionWithdrawMax(state, change),
      updatePayback: (amount?: BigNumber) => actionPayback(state, change, amount),
      updatePaybackMax: () => actionPaybackMax(state, change),

      toggleDepositAndGenerateOption: () =>
        change({
          kind: 'showDepositAndGenerateOption',
          showDepositAndGenerateOption: !state.showDepositAndGenerateOption,
        }),
      togglePaybackAndWithdrawOption: () =>
        change({
          kind: 'showPaybackAndWithdrawOption',
          showPaybackAndWithdrawOption: !state.showPaybackAndWithdrawOption,
        }),

      toggle: () => toggleEditing(state, change),
      progress: () => progressEditing(state, change),
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
      progress: () => progressProxy(state, change),
      reset: () => change({ kind: 'stage', stage: state.originalEditingStage }),
    }
  }

  if (
    state.stage === 'collateralAllowanceWaitingForConfirmation' ||
    state.stage === 'collateralAllowanceFailure'
  ) {
    return {
      ...state,
      updateCollateralAllowanceAmount: (amount?: BigNumber) =>
        change({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: amount }),
      setCollateralAllowanceAmountUnlimited: () =>
        change({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: maxUint256 }),
      setCollateralAllowanceAmountToDepositAmount: () =>
        change({
          kind: 'collateralAllowanceAmount',
          collateralAllowanceAmount: state.depositAmount,
        }),
      resetCollateralAllowanceAmount: () =>
        change({ kind: 'collateralAllowanceAmount', collateralAllowanceAmount: undefined }),

      progress: () => setCollateralAllowance(txHelpers, collateralAllowance$, change, state),
      reset: () => change({ kind: 'stage', stage: state.originalEditingStage }),
    }
  }

  if (state.stage === 'collateralAllowanceSuccess') {
    return {
      ...state,
      progress: () => progressCollateralAllowance(state, change),
    }
  }

  if (
    state.stage === 'daiAllowanceWaitingForConfirmation' ||
    state.stage === 'daiAllowanceFailure'
  ) {
    return {
      ...state,
      updateDaiAllowanceAmount: (amount?: BigNumber) =>
        change({ kind: 'daiAllowanceAmount', daiAllowanceAmount: amount }),
      setDaiAllowanceAmountUnlimited: () =>
        change({ kind: 'daiAllowanceAmount', daiAllowanceAmount: maxUint256 }),
      setDaiAllowanceAmountToPaybackAmount: () =>
        change({ kind: 'daiAllowanceAmount', daiAllowanceAmount: state.depositAmount }),
      resetDaiAllowanceAmount: () =>
        change({ kind: 'daiAllowanceAmount', daiAllowanceAmount: undefined }),

      progress: () => setDaiAllowance(txHelpers, daiAllowance$, change, state),
      reset: () => change({ kind: 'stage', stage: state.originalEditingStage }),
    }
  }

  if (state.stage === 'daiAllowanceSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'stage',
          stage: state.originalEditingStage,
        }),
    }
  }

  if (state.stage === 'manageWaitingForConfirmation' || state.stage === 'manageFailure') {
    return {
      ...state,
      progress: () => progressManage(txHelpers, state, change),
      reset: () => change({ kind: 'stage', stage: state.originalEditingStage }),
    }
  }

  if (state.stage === 'manageSuccess') {
    return {
      ...state,
      progress: () => resetBackToEditingStage(state, change),
    }
  }

  return state
}

function vaultChange$<T extends keyof Vault>(vaultData$: Observable<Vault>, kind: T) {
  return vaultData$.pipe(
    map((vault) => ({
      kind,
      [kind]: vault[kind],
    })),
  )
}

function ilkDataChange$<T extends keyof IlkData>(ilkData$: Observable<IlkData>, kind: T) {
  return ilkData$.pipe(
    map((ilkData) => ({
      kind,
      [kind]: ilkData[kind],
    })),
  )
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
}

export function createManageVault$(
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
        switchMap(
          ({
            token,
            ilk,
            lockedCollateral,
            lockedCollateralPrice,
            debt,
            collateralizationRatio,
            liquidationPrice,
            liquidationPenalty,
            freeCollateral,
            stabilityFee,
            controller,
          }) => {
            return combineLatest(
              defaultState$,
              userTokenInfo$(token, account),
              ilkData$(ilk),
              proxyAddress$(account),
            ).pipe(
              first(),
              switchMap(
                ([
                  defaultState,
                  userTokenInfo,
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
                        ...userTokenInfo,
                        ...defaultState,
                        token,
                        id,
                        account,
                        accountIsController: account === controller,

                        lockedCollateral,
                        lockedCollateralPrice,
                        debt,
                        liquidationPrice,
                        collateralizationRatio,
                        freeCollateral,
                        liquidationPenalty,

                        ilk,
                        maxDebtPerUnitCollateral,
                        ilkDebtAvailable,
                        debtFloor,
                        stabilityFee,
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

                      const userTokenInfoChange$ = curry(createUserTokenInfoChange$)(userTokenInfo$)

                      const environmentChanges$ = merge(
                        userTokenInfoChange$(token, account, 'collateralBalance'),
                        userTokenInfoChange$(token, account, 'ethBalance'),
                        userTokenInfoChange$(token, account, 'daiBalance'),
                        userTokenInfoChange$(token, account, 'currentCollateralPrice'),
                        userTokenInfoChange$(token, account, 'currentEthPrice'),
                        userTokenInfoChange$(token, account, 'nextCollateralPrice'),
                        userTokenInfoChange$(token, account, 'nextEthPrice'),
                        userTokenInfoChange$(token, account, 'dateLastCollateralPrice'),
                        userTokenInfoChange$(token, account, 'dateNextCollateralPrice'),
                        userTokenInfoChange$(token, account, 'dateLastEthPrice'),
                        userTokenInfoChange$(token, account, 'dateNextEthPrice'),
                        userTokenInfoChange$(token, account, 'isStaticCollateralPrice'),
                        userTokenInfoChange$(token, account, 'isStaticEthPrice'),

                        ilkDataChange$(ilkData$(ilk), 'maxDebtPerUnitCollateral'),
                        ilkDataChange$(ilkData$(ilk), 'ilkDebtAvailable'),
                        ilkDataChange$(ilkData$(ilk), 'debtFloor'),

                        vaultChange$(vault$(id), 'lockedCollateral'),
                        vaultChange$(vault$(id), 'debt'),
                        vaultChange$(vault$(id), 'collateralizationRatio'),
                        vaultChange$(vault$(id), 'liquidationPrice'),
                        vaultChange$(vault$(id), 'lockedCollateralPrice'),
                        vaultChange$(vault$(id), 'freeCollateral'),
                        vaultChange$(vault$(id), 'stabilityFee'),
                        vaultChange$(vault$(id), 'liquidationPenalty'),
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
          },
        ),
      )
    }),
    map(applyIsStageStates),
  )
}
