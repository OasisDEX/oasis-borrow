import type { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import type { ProxyActionsSmartContractAdapterInterface } from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import type { VaultActionsLogicInterface } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { vaultActionsLogic } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import type { MakerVaultType } from 'blockchain/calls/vaultResolver'
import type { IlkData } from 'blockchain/ilks'
import { createIlkDataChange$ } from 'blockchain/ilks'
import type { Context } from 'blockchain/network'
import { createVaultChange$ } from 'blockchain/vaults'
import type { Vault } from 'blockchain/vaults.types'
import type { SelectedDaiAllowanceRadio } from 'components/vault/commonMultiply/ManageVaultDaiAllowance'
import type { TriggersData } from 'features/automation/api/automationTriggersData'
import { createAutomationTriggersChange$ } from 'features/automation/api/automationTriggersData'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import type { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import type { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { calculateInitialTotalSteps } from 'features/borrow/open/pipes/openVaultConditions'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import type { SaveVaultType } from 'features/generalManageVault/vaultType'
import { saveVaultTypeForAccount, VaultType } from 'features/generalManageVault/vaultType'
import type { BalanceInfo } from 'features/shared/balanceInfo'
import { balanceInfoChange$ } from 'features/shared/balanceInfo'
import type { PriceInfo } from 'features/shared/priceInfo'
import { priceInfoChange$ } from 'features/shared/priceInfo'
import type { BaseManageVaultStage } from 'features/types/vaults/BaseManageVaultStage'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { createHistoryChange$ } from 'features/vaultHistory/vaultHistory'
import type { AddGasEstimationFunction, HasGasEstimation, TxHelpers } from 'helpers/context/types'
import type { TxError } from 'helpers/types'
import { LendingProtocol } from 'lendingProtocols'
import { curry } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, merge, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import type { BorrowManageAdapterInterface } from './adapters/borrowManageAdapterInterface'
import { finalValidation, validateErrors, validateWarnings } from './manageVaultValidations'
import type { ManageVaultAllowanceChange } from './viewStateTransforms/manageVaultAllowances'
import type { ManageVaultCalculations } from './viewStateTransforms/manageVaultCalculations'
import type { ManageVaultConditions } from './viewStateTransforms/manageVaultConditions'
import type { ManageVaultEnvironmentChange } from './viewStateTransforms/manageVaultEnvironment'
import type { ManageVaultFormChange } from './viewStateTransforms/manageVaultForm'
import type { ManageVaultInputChange } from './viewStateTransforms/manageVaultInput'
import type { ManageVaultSummary } from './viewStateTransforms/manageVaultSummary'
import type { ManageVaultTransactionChange } from './viewStateTransforms/manageVaultTransactions'
import {
  applyEstimateGas,
  createProxy,
  setCollateralAllowance,
  setDaiAllowance,
} from './viewStateTransforms/manageVaultTransactions'
import type { ManageVaultTransitionChange } from './viewStateTransforms/manageVaultTransitions'
import { progressManage } from './viewStateTransforms/manageVaultTransitions'

interface ManageVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<ManageStandardBorrowVaultState>
}

export type ManageVaultChange =
  | ManageVaultInputChange
  | ManageVaultFormChange
  | ManageVaultAllowanceChange
  | ManageVaultTransitionChange
  | ManageVaultTransactionChange
  | ManageVaultEnvironmentChange
  | ManageVaultInjectedOverrideChange

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

export interface ManageVaultEnvironment<V extends Vault> {
  account?: string
  accountIsController: boolean
  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  vault: V
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

export type GenericManageBorrowVaultState<V extends Vault> = MutableManageVaultState &
  ManageVaultCalculations &
  ManageVaultConditions &
  ManageVaultEnvironment<V> &
  ManageVaultFunctions &
  ManageVaultTxInfo & {
    errorMessages: VaultErrorMessage[]
    warningMessages: VaultWarningMessage[]
    summary: ManageVaultSummary
    initialTotalSteps: number
    totalSteps: number
    currentStep: number
    stopLossData?: StopLossTriggerData
    autoBuyData?: AutoBSTriggerData
    autoSellData?: AutoBSTriggerData
    constantMultipleData?: ConstantMultipleTriggerData
    autoTakeProfitData?: AutoTakeProfitTriggerData
  } & HasGasEstimation

export type ManageStandardBorrowVaultState = GenericManageBorrowVaultState<Vault>

function addTransitions(
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: Observable<string | undefined>,
  saveVaultType$: SaveVaultType,
  proxyActions: VaultActionsLogicInterface,
  change: (ch: ManageVaultChange) => void,
  state: ManageStandardBorrowVaultState,
): ManageStandardBorrowVaultState {
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
          LendingProtocol.Maker,
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

export function createManageVault$<V extends Vault, VS extends ManageStandardBorrowVaultState>(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber, chainId: number) => Observable<V>,
  saveVaultType$: SaveVaultType,
  addGasEstimation$: AddGasEstimationFunction,
  vaultHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  proxyActionsAdapterResolver$: ({
    makerVaultType,
  }: {
    makerVaultType: MakerVaultType
  }) => Observable<ProxyActionsSmartContractAdapterInterface>,
  vaultViewStateProvider: BorrowManageAdapterInterface<V, VS>,
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>,
  id: BigNumber,
): Observable<VS> {
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
            proxyActionsAdapterResolver$({ makerVaultType: vault.makerType }),
          ).pipe(
            first(),
            switchMap(([priceInfo, balanceInfo, ilkData, proxyAddress, proxyActionsAdapter]) => {
              const vaultActions = vaultActionsLogic(proxyActionsAdapter)
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

                  const initialState = vaultViewStateProvider.createInitialViewState({
                    vault,
                    priceInfo,
                    balanceInfo,
                    ilkData,
                    account,
                    proxyAddress,
                    collateralAllowance,
                    daiAllowance,
                    context,
                    initialTotalSteps,
                    change,
                    injectStateOverride,
                  })

                  const environmentChanges$ = merge(
                    priceInfoChange$(priceInfo$, vault.token),
                    balanceInfoChange$(balanceInfo$, vault.token, account),
                    createIlkDataChange$(ilkData$, vault.ilk),
                    createVaultChange$(vault$, id, context.chainId),
                    createHistoryChange$(vaultHistory$, id),
                    createAutomationTriggersChange$(automationTriggersData$, id),
                  )

                  const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                  return merge(change$, environmentChanges$).pipe(
                    scan<ManageVaultChange, VS>(
                      vaultViewStateProvider.transformViewState,
                      initialState,
                    ),
                    map(validateErrors),
                    map(validateWarnings),
                    map(vaultViewStateProvider.addErrorsAndWarnings),
                    switchMap(curry(applyEstimateGas)(addGasEstimation$, vaultActions)),
                    map(finalValidation),
                    map(vaultViewStateProvider.addTxnCost),
                    map(
                      curry(addTransitions)(
                        txHelpers$,
                        connectedProxyAddress$,
                        saveVaultType$,
                        vaultActions,
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
