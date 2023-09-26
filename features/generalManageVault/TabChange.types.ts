import type { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import type { EarnSimulateViewMode } from 'features/earn/guni/open/containers/GuniOpenMultiplyVaultDetails.types'

export type TabChangeAction = {
  type: 'change-tab'
  currentMode: VaultViewMode | EarnSimulateViewMode
}

export interface TabChange {
  currentMode: VaultViewMode | EarnSimulateViewMode
}
