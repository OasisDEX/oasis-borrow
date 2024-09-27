import type {
  AutomationOptimizationFeatures,
  AutomationProtectionFeatures,
  AutomationTypes,
} from 'features/automation/common/state/automationFeatureChange.types'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import type { VaultProtocol } from 'helpers/getVaultProtocol'

export interface GetAutoFeaturesSidebarDropdownProps {
  type: AutomationTypes
  forcePanel: AutomationProtectionFeatures | AutomationOptimizationFeatures
  vaultType: VaultType
  protocol: VaultProtocol
  disabled?: boolean
  isStopLossEnabled?: boolean
  isAutoSellEnabled?: boolean
  isAutoBuyEnabled?: boolean
  isAutoTakeProfitEnabled?: boolean
}
export interface GetAutoFeaturesSidebarDropdownItemProps {
  translationKey: string
  type: AutomationTypes
  panel: AutomationProtectionFeatures | AutomationOptimizationFeatures
  isFeatureEnabled?: boolean
}
