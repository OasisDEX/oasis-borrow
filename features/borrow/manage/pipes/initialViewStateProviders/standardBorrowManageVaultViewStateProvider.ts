import { Vault } from 'blockchain/vaults'
import { GasEstimationStatus } from 'helpers/form'

import {
  defaultMutableManageVaultState,
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from '../manageVault'
import { applyManageVaultAllowance } from '../manageVaultAllowances'
import {
  applyManageVaultCalculations,
  defaultManageVaultCalculations,
} from '../manageVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
  defaultManageVaultConditions,
} from '../manageVaultConditions'
import { applyManageVaultEnvironment } from '../manageVaultEnvironment'
import { applyManageVaultForm } from '../manageVaultForm'
import { applyManageVaultInjectedOverride } from '../manageVaultInjectedOverride'
import { applyManageVaultInput } from '../manageVaultInput'
import { applyManageVaultSummary, defaultManageVaultSummary } from '../manageVaultSummary'
import { applyManageVaultTransaction } from '../manageVaultTransactions'
import { applyManageVaultTransition } from '../manageVaultTransitions'
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
      injectStateOverride,
    }
    return initialState
  },

  applyCalcs(state: ManageStandardBorrowVaultState, change: ManageVaultChange) {
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
