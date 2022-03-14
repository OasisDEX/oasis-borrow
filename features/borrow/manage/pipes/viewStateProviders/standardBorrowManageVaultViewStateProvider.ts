import { Vault } from 'blockchain/vaults'
import { GasEstimationStatus } from 'helpers/form'

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
  BorrowManageVaultViewStateProviderInterface,
  CreateInitialVaultStateArgs,
} from './borrowManageVaultViewStateProviderInterface'

export const StandardBorrowManageVaultViewStateProvider: BorrowManageVaultViewStateProviderInterface<
  Vault,
  ManageStandardBorrowVaultState
> = {
  createInitialVaultState(args: CreateInitialVaultStateArgs<Vault>) {
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
      clear: () => change({ kind: 'clear' }),
      gasEstimationStatus: GasEstimationStatus.unset,
      vaultHistory: [],
      stopLossData: undefined,
      injectStateOverride,
    }
    return initialState
  },

  applyChange(state: ManageStandardBorrowVaultState, change: ManageVaultChange) {
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
  },
}
