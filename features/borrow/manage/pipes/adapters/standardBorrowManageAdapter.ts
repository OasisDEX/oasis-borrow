import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { Vault } from 'blockchain/vaults.types'
import { defaultMutableManageVaultState } from 'features/borrow/manage/pipes/manageVault.constants'
import type {
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from 'features/borrow/manage/pipes/manageVault.types'
import { applyManageVaultAllowance } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultAllowances'
import { applyManageVaultCalculations } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultCalculations'
import { defaultManageVaultCalculations } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultCalculations.constants'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
} from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultConditions'
import { defaultManageVaultConditions } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultConditions.constants'
import { applyManageVaultEnvironment } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultEnvironment'
import { applyManageVaultForm } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultForm'
import { applyManageVaultInjectedOverride } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultInjectedOverride'
import { applyManageVaultInput } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultInput'
import { applyManageVaultSummary } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultSummary'
import { defaultManageVaultSummary } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultSummary.constants'
import { applyManageVaultTransaction } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultTransactions'
import { applyManageVaultTransition } from 'features/borrow/manage/pipes/viewStateTransforms/manageVaultTransitions'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { zero } from 'helpers/zero'

import type {
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
      safeConfirmations: getNetworkContracts(NetworkIds.MAINNET, context.chainId).safeConfirmations,
      etherscan: getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan.url,
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
      autoBuyData: undefined,
      autoSellData: undefined,
      constantMultipleData: undefined,
      injectStateOverride,
    }
    return initialState
  },
}
