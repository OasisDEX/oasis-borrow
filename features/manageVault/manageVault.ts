import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { createVaultChange$, Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import { BalanceInfo, balanceInfoChange$ } from '../shared/balanceInfo'
import { applyManageVaultAllowance, ManageVaultAllowanceChange } from './manageVaultAllowances'
import {
  applyManageVaultCalculations,
  defaultManageVaultCalculations,
  ManageVaultCalculations,
} from './manageVaultCalculations'
import {
  applyManageVaultConditions,
  defaultManageVaultConditions,
  ManageVaultConditions,
} from './manageVaultConditions'
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
import { validateErrors, validateWarnings } from './manageVaultValidations'

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
  const s8 = applyManageVaultCalculations(s7)
  return applyManageVaultConditions(s8)
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

export interface MutableManageVaultState {
  stage: ManageVaultStage
  originalEditingStage: ManageVaultEditingStage
  showDepositAndGenerateOption: boolean
  showPaybackAndWithdrawOption: boolean
  showIlkDetails: boolean
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  generateAmount?: BigNumber
  paybackAmount?: BigNumber
  collateralAllowanceAmount?: BigNumber
  daiAllowanceAmount?: BigNumber
  selectedCollateralAllowanceRadio: 'unlimited' | 'depositAmount' | 'custom'
  selectedDaiAllowanceRadio: 'unlimited' | 'paybackAmount' | 'custom'
}

export interface ManageVaultEnvironment {
  account?: string
  accountIsController: boolean
  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  priceInfo: PriceInfo
}

interface ManageVaultFunctions {
  progress?: () => void
  reset?: () => void
  toggle?: () => void
  toggleIlkDetails?: () => void
  toggleDepositAndGenerateOption?: () => void
  togglePaybackAndWithdrawOption?: () => void
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositMax?: () => void
  updateGenerate?: (generateAmount?: BigNumber) => void
  updateGenerateMax?: () => void
  updateWithdraw?: (withdrawAmount?: BigNumber) => void
  updateWithdrawUSD?: (withdrawAmountUSD?: BigNumber) => void
  updateWithdrawMax?: () => void
  updatePayback?: (paybackAmount?: BigNumber) => void
  updatePaybackMax?: () => void
  updateCollateralAllowanceAmount?: (amount?: BigNumber) => void
  setCollateralAllowanceAmountUnlimited?: () => void
  setCollateralAllowanceAmountToDepositAmount?: () => void
  resetCollateralAllowanceAmount?: () => void
  updateDaiAllowanceAmount?: (amount?: BigNumber) => void
  setDaiAllowanceAmountUnlimited?: () => void
  setDaiAllowanceAmountToPaybackAmount?: () => void
  resetDaiAllowanceAmount?: () => void
  injectStateOverride: (state: Partial<MutableManageVaultState>) => void
}

interface ManageVaultTxInfo {
  collateralAllowanceTxHash?: string
  daiAllowanceTxHash?: string
  proxyTxHash?: string
  manageTxHash?: string
  txError?: any
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
}

export type ManageVaultState = MutableManageVaultState &
  ManageVaultCalculations &
  ManageVaultConditions &
  ManageVaultEnvironment &
  ManageVaultFunctions &
  ManageVaultTxInfo

function addTransitions(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
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
          kind: 'collateralAllowanceReset',
        }),
      progress: () => setCollateralAllowance(txHelpers$, change, state),
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
          kind: 'daiAllowanceReset',
        }),
      progress: () => setDaiAllowance(txHelpers$, change, state),
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

export const defaultMutableManageVaultState: MutableManageVaultState = {
  stage: 'collateralEditing' as ManageVaultStage,
  originalEditingStage: 'collateralEditing' as ManageVaultEditingStage,
  showIlkDetails: false,
  showDepositAndGenerateOption: false,
  showPaybackAndWithdrawOption: false,
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
  selectedCollateralAllowanceRadio: 'unlimited' as 'unlimited',
  selectedDaiAllowanceRadio: 'unlimited' as 'unlimited',
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
                  function injectStateOverride(stateToOverride: Partial<MutableManageVaultState>) {
                    return change$.next({ kind: 'injectStateOverride', stateToOverride })
                  }

                  const initialState: ManageVaultState = {
                    ...defaultMutableManageVaultState,
                    ...defaultManageVaultCalculations,
                    ...defaultManageVaultConditions,
                    vault,
                    priceInfo,
                    balanceInfo,
                    ilkData,
                    account,
                    proxyAddress,
                    collateralAllowance,
                    daiAllowance,
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

                  return merge(change$, environmentChanges$).pipe(
                    scan(apply, initialState),
                    map(validateErrors),
                    map(validateWarnings),
                    map(curry(addTransitions)(txHelpers$, connectedProxyAddress$, change)),
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
