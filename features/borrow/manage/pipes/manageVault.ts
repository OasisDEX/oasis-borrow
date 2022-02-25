import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { createVaultChange$, Vault } from 'blockchain/vaults'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { calculateInitialTotalSteps } from 'features/borrow/open/pipes/openVaultConditions'
import { saveVaultTypeForAccount, VaultType } from 'features/generalManageVault/vaultType'
import { SaveVaultType } from 'features/generalManageVault/vaultType'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import { WithdrawPaybackDepositGenerateLogicInterface } from '../../../../blockchain/calls/proxyActions/proxyActions'
import { SelectedDaiAllowanceRadio } from '../../../../components/vault/commonMultiply/ManageVaultDaiAllowance'
import { TxError } from '../../../../helpers/types'
import { VaultErrorMessage } from '../../../form/errorMessagesHandler'
import { VaultWarningMessage } from '../../../form/warningMessagesHandler'
import { BalanceInfo, balanceInfoChange$ } from '../../../shared/balanceInfo'
import { BaseManageVaultStage } from '../../../types/vaults/BaseManageVaultStage'
import { VaultHistoryEvent } from '../../../vaultHistory/vaultHistory'
import { createHistoryChange$ } from './manageHistory'
import { applyManageVaultAllowance, ManageVaultAllowanceChange } from './manageVaultAllowances'
import {
  applyManageVaultCalculations,
  defaultManageVaultCalculations,
  ManageVaultCalculations,
} from './manageVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
  defaultManageVaultConditions,
  ManageVaultConditions,
} from './manageVaultConditions'
import { applyManageVaultEnvironment, ManageVaultEnvironmentChange } from './manageVaultEnvironment'
import { applyManageVaultForm, ManageVaultFormChange } from './manageVaultForm'
import { applyManageVaultInput, ManageVaultInputChange } from './manageVaultInput'
import {
  applyManageVaultSummary,
  defaultManageVaultSummary,
  ManageVaultSummary,
} from './manageVaultSummary'
import {
  applyEstimateGas,
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
  const s9 = applyManageVaultStageCategorisation(s8)
  const s10 = applyManageVaultConditions(s9)
  return applyManageVaultSummary(s10)
}

export type ManageVaultEditingStage =
  | 'collateralEditing'
  | 'daiEditing'
  | 'multiplyTransitionEditing'

export type ManageBorrowVaultStage =
  | BaseManageVaultStage
  | ManageVaultEditingStage
  | 'multiplyTransitionWaitingForConfirmation'
  | 'multiplyTransitionInProgress'
  | 'multiplyTransitionFailure'
  | 'multiplyTransitionSuccess'

export type MainAction = 'depositGenerate' | 'withdrawPayback'

export interface MutableManageVaultState {
  stage: ManageBorrowVaultStage
  mainAction: MainAction
  originalEditingStage: ManageVaultEditingStage
  showDepositAndGenerateOption: boolean
  showPaybackAndWithdrawOption: boolean
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  generateAmount?: BigNumber
  paybackAmount?: BigNumber
  collateralAllowanceAmount?: BigNumber
  daiAllowanceAmount?: BigNumber
  selectedCollateralAllowanceRadio: 'unlimited' | 'depositAmount' | 'custom'
  selectedDaiAllowanceRadio: SelectedDaiAllowanceRadio
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
  vaultHistory: VaultHistoryEvent[]
}

interface ManageVaultFunctions {
  progress?: () => void
  regress?: () => void
  toggle?: (stage: ManageVaultEditingStage) => void
  setMainAction?: (action: MainAction) => void
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
  clear: () => void
  injectStateOverride: (state: Partial<MutableManageVaultState>) => void
  toggleMultiplyTransition?: () => void
}

interface ManageVaultTxInfo {
  collateralAllowanceTxHash?: string
  daiAllowanceTxHash?: string
  proxyTxHash?: string
  manageTxHash?: string
  txError?: TxError
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
}

export type ManageVaultState = MutableManageVaultState &
  ManageVaultCalculations &
  ManageVaultConditions &
  ManageVaultEnvironment &
  ManageVaultFunctions &
  ManageVaultTxInfo & {
    errorMessages: VaultErrorMessage[]
    warningMessages: VaultWarningMessage[]
    summary: ManageVaultSummary
    initialTotalSteps: number
    totalSteps: number
    currentStep: number
  } & HasGasEstimation

function addTransitions(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  saveVaultType$: SaveVaultType,
  proxyActions: WithdrawPaybackDepositGenerateLogicInterface,
  change: (ch: ManageVaultChange) => void,
  state: ManageVaultState,
): ManageVaultState {
  if (state.stage === 'multiplyTransitionEditing') {
    return {
      ...state,
      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      progress: () => change({ kind: 'progressMultiplyTransition' }),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (
    state.stage === 'multiplyTransitionWaitingForConfirmation' ||
    state.stage === 'multiplyTransitionFailure'
  ) {
    return {
      ...state,
      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      progress: () => {
        saveVaultTypeForAccount(
          saveVaultType$,
          state.account as string,
          state.vault.id,
          VaultType.Multiply,
          state.vault.chainId,
          () => {
            window.location.reload()
            change({ kind: 'multiplyTransitionSuccess' })
          },
          () => change({ kind: 'multiplyTransitionFailure' }),
          () => change({ kind: 'multiplyTransitionInProgress' }),
        )
      },
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'collateralEditing' || state.stage === 'daiEditing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) => {
        change({ kind: 'deposit', depositAmount })
      },
      updateDepositUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: 'depositUSD', depositAmountUSD }),
      updateDepositMax: () => change({ kind: 'depositMax' }),
      updateGenerate: (generateAmount?: BigNumber) => {
        change({ kind: 'generate', generateAmount })
      },
      updateGenerateMax: () => change({ kind: 'generateMax' }),
      updateWithdraw: (withdrawAmount?: BigNumber) => {
        change({ kind: 'withdraw', withdrawAmount })
      },
      updateWithdrawUSD: (withdrawAmountUSD?: BigNumber) =>
        change({ kind: 'withdrawUSD', withdrawAmountUSD }),
      updateWithdrawMax: () => change({ kind: 'withdrawMax' }),
      updatePayback: (paybackAmount?: BigNumber) => {
        change({ kind: 'payback', paybackAmount })
      },
      updatePaybackMax: () => change({ kind: 'paybackMax' }),
      toggleDepositAndGenerateOption: () =>
        change({
          kind: 'toggleDepositAndGenerateOption',
        }),
      togglePaybackAndWithdrawOption: () =>
        change({
          kind: 'togglePaybackAndWithdrawOption',
        }),
      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      progress: () => change({ kind: 'progressEditing' }),
      setMainAction: (mainAction: MainAction) => change({ kind: 'mainAction', mainAction }),
    }
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers$, proxyAddress$, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'progressProxy' }),
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
      regress: () => change({ kind: 'regressCollateralAllowance' }),
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
      setDaiAllowanceAmountUnlimited: () => change({ kind: 'daiAllowanceUnlimited' }),
      setDaiAllowanceAmountToPaybackAmount: () => change({ kind: 'daiAllowanceAsPaybackAmount' }),
      resetDaiAllowanceAmount: () =>
        change({
          kind: 'daiAllowanceReset',
        }),
      progress: () => setDaiAllowance(txHelpers$, change, state),
      regress: () => change({ kind: 'regressDaiAllowance' }),
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
      progress: () => progressManage(txHelpers$, state, change, proxyActions),
      regress: () => change({ kind: 'backToEditing' }),
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
  stage: 'collateralEditing' as ManageBorrowVaultStage,
  mainAction: 'depositGenerate',
  originalEditingStage: 'collateralEditing' as ManageVaultEditingStage,
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
  vault$: (id: BigNumber, chainId: number) => Observable<Vault>,
  saveVaultType$: SaveVaultType,
  addGasEstimation$: AddGasEstimationFunction,
  vaultHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  proxyActions: WithdrawPaybackDepositGenerateLogicInterface,
  id: BigNumber,
): Observable<ManageVaultState> {
  return context$.pipe(
    switchMap((context) => {
      const account = context.status === 'connected' ? context.account : undefined
      return vault$(id, context.chainId).pipe(
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
              vault.chainId = context.chainId
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

                  const initialTotalSteps = calculateInitialTotalSteps(
                    proxyAddress,
                    vault.token,
                    collateralAllowance,
                  )

                  const initialState: ManageVaultState = {
                    ...defaultMutableManageVaultState,
                    ...defaultManageVaultCalculations,
                    ...defaultManageVaultConditions,
                    vault,
                    priceInfo,
                    vaultHistory: [],
                    balanceInfo,
                    ilkData,
                    account,
                    proxyAddress,
                    collateralAllowance,
                    daiAllowance,
                    safeConfirmations: context.safeConfirmations,
                    etherscan: context.etherscan.url,
                    errorMessages: [],
                    warningMessages: [],
                    summary: defaultManageVaultSummary,
                    initialTotalSteps,
                    totalSteps: initialTotalSteps,
                    currentStep: 1,
                    clear: () => change({ kind: 'clear' }),
                    gasEstimationStatus: GasEstimationStatus.unset,
                    injectStateOverride,
                  }

                  const environmentChanges$ = merge(
                    priceInfoChange$(priceInfo$, vault.token),
                    balanceInfoChange$(balanceInfo$, vault.token, account),
                    createIlkDataChange$(ilkData$, vault.ilk),
                    createVaultChange$(vault$, id, context.chainId),
                    createHistoryChange$(vaultHistory$, id),
                  )

                  const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                  return merge(change$, environmentChanges$).pipe(
                    scan(apply, initialState),
                    map(validateErrors),
                    map(validateWarnings),
                    switchMap(curry(applyEstimateGas)(addGasEstimation$, proxyActions)),
                    map(
                      curry(addTransitions)(
                        txHelpers$,
                        connectedProxyAddress$,
                        saveVaultType$,
                        proxyActions,
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
