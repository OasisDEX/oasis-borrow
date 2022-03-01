import BigNumber from 'bignumber.js'
import { InstiVault } from 'blockchain/instiVault'

import {
  ManageInstiVaultState,
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from '../manageVault'
import { applyManageVaultAllowance } from '../manageVaultAllowances'
import { applyManageVaultCalculations } from '../manageVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
} from '../manageVaultConditions'
import { applyManageVaultEnvironment } from '../manageVaultEnvironment'
import { applyManageVaultForm } from '../manageVaultForm'
import { applyManageVaultInjectedOverride } from '../manageVaultInjectedOverride'
import { applyManageVaultInput } from '../manageVaultInput'
import { applyManageVaultSummary } from '../manageVaultSummary'
import { applyManageVaultTransaction } from '../manageVaultTransactions'
import { applyManageVaultTransition } from '../manageVaultTransitions'
import {
  BorrowManageVaultViewStateProviderInterface,
  CreateInitialVaultStateArgs,
} from './borrowManageVaultViewStateProviderInterface'
import { StandardBorrowManageVaultViewStateProvider } from './standardBorrowManageVaultViewStateProvider'

function applyManageInstiVaultCaculations(viewState: ManageInstiVaultState): ManageInstiVaultState {
  return {
    ...viewState,
    originationFeeAbsoluteValue: viewState.generateAmount?.times(
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
      originationFeeAbsoluteValue: new BigNumber(0),
      originationFee: args.vault.originationFeePercent,
      activeCollRatio: args.vault.activeCollRatio,
      debtCeiling: args.vault.debtCeiling,
    }
  },
  applyCalcs(viewState, change: ManageVaultChange) {
    const s1 = applyManageVaultInput<ManageInstiVaultState>(change, viewState)
    const s2 = applyManageVaultForm<ManageInstiVaultState>(change, s1)
    const s3 = applyManageVaultAllowance<ManageInstiVaultState>(change, s2)
    const s4 = applyManageVaultTransition<ManageInstiVaultState>(change, s3)
    const s5 = applyManageVaultTransaction<ManageInstiVaultState>(change, s4)
    const s6 = applyManageVaultEnvironment<ManageInstiVaultState>(change, s5)
    const s7 = applyManageVaultInjectedOverride<ManageInstiVaultState>(change, s6)
    const s8 = applyManageVaultCalculations<ManageInstiVaultState>(s7)
    const s9 = applyManageInstiVaultCaculations(s8)
    const s10 = applyManageVaultStageCategorisation<ManageInstiVaultState>(s9)
    const s11 = applyManageVaultConditions<ManageInstiVaultState>(s10)
    return applyManageVaultSummary<ManageInstiVaultState>(s11)
  },
}
