import type { AaveManageVaultState } from 'features/automation/contexts/AaveAutomationContext'
import type { VaultType } from 'features/generalManageVault/vaultType.types'

export interface GetAutomationAavePositionDataParams {
  aaveManageVault: AaveManageVaultState
  vaultType?: VaultType
}
