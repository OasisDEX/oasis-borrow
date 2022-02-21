import { InstiVault } from 'blockchain/instiVault'
import { ManageInstiVaultState, ManageVaultState } from '../manageVault'
import {
  CreateInitialVaultStateArgs,
  BorrowManageVaultViewStateProviderInterface,
} from './borrowManageVaultViewStateProviderInterface'
import { StandardBorrowManageVaultViewStateProvider } from './standardBorrowManageVaultViewStateProvider'

export const InstitutionalBorrowManageVaultViewStateProvider: BorrowManageVaultViewStateProviderInterface<
  InstiVault,
  ManageInstiVaultState
> = {
  createInitialVaultState(args: CreateInitialVaultStateArgs<InstiVault>): ManageInstiVaultState {
    const mananageStandardVaultViewState: ManageVaultState = StandardBorrowManageVaultViewStateProvider.createInitialVaultState(
      args,
    )

    return {
      ...mananageStandardVaultViewState,
      originationFee: args.vault.originationFee,
      activeCollRatio: args.vault.activeCollRatio,
      debtCeiling: args.vault.debtCeiling,
    }
  },
}
