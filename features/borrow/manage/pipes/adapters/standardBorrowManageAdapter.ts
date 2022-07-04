import { Vault } from 'blockchain/vaults'
import { GasEstimationStatus } from 'helpers/form'

import { zero } from '../../../../../helpers/zero'
import {
  defaultMutableManageVaultState,
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from '../manageVault'
import { applyManageVaultAllowance } from '../viewStateTransforms/manageVaultAllowances'
import {
  applyManageVaultCalculations,
  defaultManageVaultCalculations,
} from '../viewStateTransforms/manageVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
  defaultManageVaultConditions,
} from '../viewStateTransforms/manageVaultConditions'
import { applyManageVaultEnvironment } from '../viewStateTransforms/manageVaultEnvironment'
import { applyManageVaultForm } from '../viewStateTransforms/manageVaultForm'
import { applyManageVaultInjectedOverride } from '../viewStateTransforms/manageVaultInjectedOverride'
import { applyManageVaultInput } from '../viewStateTransforms/manageVaultInput'
import {
  applyManageVaultSummary,
  defaultManageVaultSummary,
} from '../viewStateTransforms/manageVaultSummary'
import { applyManageVaultTransaction } from '../viewStateTransforms/manageVaultTransactions'
import { applyManageVaultTransition } from '../viewStateTransforms/manageVaultTransitions'
import {
  BorrowManageAdapterInterface,
  CreateInitialVaultStateArgs,
} from './borrowManageAdapterInterface'

export const StandardBorrowManageAdapter: BorrowManageAdapterInterface<
  Vault,
  ManageStandardBorrowVaultState
> = {
  addErrorsAndWarnings(viewState: ManageStandardBorrowVaultState): ManageStandardBorrowVaultState {
    return viewState
  },

  transformViewState(
    viewState: ManageStandardBorrowVaultState,
    change: ManageVaultChange,
  ): ManageStandardBorrowVaultState {
    const s1 = applyManageVaultInput(change, viewState)
    const s2 = applyManageVaultForm(change, s1)
    const s3 = applyManageVaultAllowance(change, s2)
    const s4 = applyManageVaultTransition(change, s3)
    const s5 = applyManageVaultTransaction(change, s4)
    const s6 = applyManageVaultEnvironment(change, s5)
    const s7 = applyManageVaultInjectedOverride(change, s6)
    const s8 = applyManageVaultCalculations(s7, zero, s7.ilkData.liquidationRatio)
    const s9 = applyManageVaultStageCategorisation(s8)
    const s10 = applyManageVaultConditions(s9)
    return applyManageVaultSummary(s10)
  },

  addTxnCost(viewState: ManageStandardBorrowVaultState): ManageStandardBorrowVaultState {
    return viewState
  },

  createInitialViewState(args: CreateInitialVaultStateArgs<Vault>) {
    const {
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
    } = args
    const initialState: ManageStandardBorrowVaultState = {
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
      errorMessages: [],
      warningMessages: [],
      summary: defaultManageVaultSummary,
      initialTotalSteps,
      totalSteps: initialTotalSteps,
      currentStep: 1,
      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
      clear: () => change({ kind: 'clear' }),
      gasEstimationStatus: GasEstimationStatus.unset,
      vaultHistory: [],
      stopLossData: undefined,
      basicBuyData: undefined,
      basicSellData: undefined,
      injectStateOverride,
    }
    return initialState
  },
}
