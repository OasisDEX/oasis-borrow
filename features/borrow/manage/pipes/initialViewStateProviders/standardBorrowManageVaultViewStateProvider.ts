import { Vault } from 'blockchain/vaults'
import { GasEstimationStatus } from 'helpers/form'
import { defaultMutableManageVaultState, ManageVaultState } from '../manageVault'
import { defaultManageVaultCalculations } from '../manageVaultCalculations'
import { defaultManageVaultConditions } from '../manageVaultConditions'
import { defaultManageVaultSummary } from '../manageVaultSummary'
import {
  CreateInitialVaultStateArgs,
  VaultViewStateProviderInterface,
} from './borrowManageVaultViewStateProviderInterface'

export const StandardBorrowManageVaultViewStateProvider: VaultViewStateProviderInterface<
  Vault,
  ManageVaultState
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
    return initialState
  },
}
