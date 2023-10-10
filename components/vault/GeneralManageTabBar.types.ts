import type { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault.types'

export enum VaultViewMode {
  Overview = 'overview',
  Protection = 'protection',
  Optimization = 'optimization',
  History = 'history',
  PositionInfo = 'position-info',
  VaultInfo = 'vault-info',
}

export interface GeneralManageTabBarProps {
  generalManageVault: GeneralManageVaultState
  positionInfo?: JSX.Element
  showAutomationTabs: boolean
}
