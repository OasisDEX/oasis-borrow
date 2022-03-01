import { InstiVault } from 'blockchain/instiVault'

import {
  ManageInstiVaultState,
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from '../manageVault'
import { applyManageVaultAllowance } from '../viewStateTransforms/manageVaultAllowances'
import { applyManageVaultCalculations } from '../viewStateTransforms/manageVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
} from '../viewStateTransforms/manageVaultConditions'
import { applyManageVaultEnvironment } from '../viewStateTransforms/manageVaultEnvironment'
import { applyManageVaultForm } from '../viewStateTransforms/manageVaultForm'
import { applyManageVaultInjectedOverride } from '../viewStateTransforms/manageVaultInjectedOverride'
import { applyManageVaultInput } from '../viewStateTransforms/manageVaultInput'
import { applyManageVaultSummary } from '../viewStateTransforms/manageVaultSummary'
import { applyManageVaultTransaction } from '../viewStateTransforms/manageVaultTransactions'
import { applyManageVaultTransition } from '../viewStateTransforms/manageVaultTransitions'
import {
  BorrowManageVaultViewStateProviderInterface,
  CreateInitialVaultStateArgs,
} from './borrowManageVaultViewStateProviderInterface'
import { StandardBorrowManageVaultViewStateProvider } from './standardBorrowManageVaultViewStateProvider'

function applyManageInstiVaultCalculations(
  viewState: ManageInstiVaultState,
): ManageInstiVaultState {
  return {
    ...viewState,
    originationFeeUSD: viewState.generateAmount?.times(
      viewState.vault.originationFeePercent.dividedBy(100),
    ),
  }
}

export const InstitutionalBorrowManageVaultViewStateProvider: BorrowManageVaultViewStateProviderInterface<
  InstiVault,
  ManageInstiVaultState
> = {
  createInitialVaultState(args: CreateInitialVaultStateArgs<InstiVault>): ManageInstiVaultState {
    const mananageStandardVaultViewState: ManageStandardBorrowVaultState = {
      ...StandardBorrowManageVaultViewStateProvider.createInitialVaultState(args),
      vault: args.vault,
    }
    return {
      ...mananageStandardVaultViewState,
      vault: args.vault,
      originationFeeUSD: undefined,
    }
  },
  applyChange(viewState, change: ManageVaultChange) {
    const s1 = applyManageVaultInput<ManageInstiVaultState>(change, viewState)
    const s2 = applyManageVaultForm<ManageInstiVaultState>(change, s1)
    const s3 = applyManageVaultAllowance<ManageInstiVaultState>(change, s2)
    const s4 = applyManageVaultTransition<ManageInstiVaultState>(change, s3)
    const s5 = applyManageVaultTransaction<ManageInstiVaultState>(change, s4)
    const s6 = applyManageVaultEnvironment<ManageInstiVaultState>(change, s5)
    const s7 = applyManageVaultInjectedOverride<ManageInstiVaultState>(change, s6)
    const s8 = applyManageVaultCalculations<ManageInstiVaultState>(s7)
    const s9 = applyManageInstiVaultCalculations(s8)
    const s10 = applyManageVaultStageCategorisation<ManageInstiVaultState>(s9)
    const s11 = applyManageVaultConditions<ManageInstiVaultState>(s10)
    return applyManageVaultSummary<ManageInstiVaultState>(s11)
  },
}
