import type { DefaultVaultHeaderProps } from 'components/vault/DefaultVaultHeader'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'

export interface ManageMultiplyVaultContainerProps {
  manageVault: ManageMultiplyVaultState
}
export interface ManageMultiplyVaultContainerComponents {
  header: (props: DefaultVaultHeaderProps) => JSX.Element
  details: (props: ManageMultiplyVaultState) => JSX.Element
  form: (props: ManageMultiplyVaultState) => JSX.Element
  history: (props: { vaultHistory: VaultHistoryEvent[] }) => JSX.Element
}
