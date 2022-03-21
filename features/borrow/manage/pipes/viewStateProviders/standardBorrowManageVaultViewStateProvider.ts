import { Vault } from 'blockchain/vaults'
import { GasEstimationStatus } from 'helpers/form'

import { defaultMutableManageVaultState, ManageStandardBorrowVaultState } from '../manageVault'
import { defaultManageVaultCalculations } from '../viewStateTransforms/manageVaultCalculations'
import { defaultManageVaultConditions } from '../viewStateTransforms/manageVaultConditions'
import { defaultManageVaultSummary } from '../viewStateTransforms/manageVaultSummary'
import {
  BorrowManageVaultViewStateProviderInterface,
  CreateInitialVaultStateArgs,
} from './borrowManageVaultViewStateProviderInterface'

export const StandardBorrowManageVaultViewStateProvider: BorrowManageVaultViewStateProviderInterface<
  Vault,
  ManageStandardBorrowVaultState
> = {
  addTxnCost(viewState: ManageStandardBorrowVaultState): ManageStandardBorrowVaultState {
    return viewState
  },
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
}
