import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import type { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import { getAvailableAutomation } from 'features/automation/common/helpers/getAvailableAutomation'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import type {
  AutomationOptimizationFeatures,
  AutomationProtectionFeatures,
} from 'features/automation/common/state/automationFeatureChange.types'
import { AutomationFeatures } from 'features/automation/common/types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { uiChanges } from 'helpers/uiChanges'
import { useTranslation } from 'next-i18next'

import type {
  GetAutoFeaturesSidebarDropdownItemProps,
  GetAutoFeaturesSidebarDropdownProps,
} from './getAutoFeaturesSidebarDropdown.types'

function getAutoFeaturesSidebarDropdownItem({
  translationKey,
  type,
  panel,
  isFeatureEnabled,
}: GetAutoFeaturesSidebarDropdownItemProps): SidebarSectionHeaderSelectItem {
  const { t } = useTranslation()

  return {
    label: `${t(isFeatureEnabled ? 'manage' : 'setup')} ${t(translationKey)}`,
    shortLabel: t(translationKey),
    iconShrink: 2,
    icon: 'circle_exchange',
    panel,
    action: () => {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type,
        ...(type === 'Protection' && {
          currentProtectionFeature: panel as AutomationProtectionFeatures,
        }),
        ...(type === 'Optimization' && {
          currentOptimizationFeature: panel as AutomationOptimizationFeatures,
        }),
      })
    },
  }
}

export function getAutoFeaturesSidebarDropdown({
  type,
  forcePanel,
  disabled,
  isStopLossEnabled,
  isAutoSellEnabled,
  isAutoBuyEnabled,
  isAutoConstantMultipleEnabled,
  isAutoTakeProfitEnabled,
  vaultType,
  protocol,
}: GetAutoFeaturesSidebarDropdownProps): SidebarSectionHeaderDropdown | undefined {
  const stopLossDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.stop-loss',
    type: 'Protection',
    panel: AutomationFeatures.STOP_LOSS,
    isFeatureEnabled: isStopLossEnabled,
  })
  const autoSellDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.basic-sell',
    type: 'Protection',
    panel: AutomationFeatures.AUTO_SELL,
    isFeatureEnabled: isAutoSellEnabled,
  })
  const basicBuyDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.basic-buy',
    type: 'Optimization',
    panel: AutomationFeatures.AUTO_BUY,
    isFeatureEnabled: isAutoBuyEnabled,
  })
  const constantMultipleDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.constant-multiple',
    type: 'Optimization',
    panel: AutomationFeatures.CONSTANT_MULTIPLE,
    isFeatureEnabled: isAutoConstantMultipleEnabled,
  })
  const autoTakeProfitDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.auto-take-profit',
    type: 'Optimization',
    panel: AutomationFeatures.AUTO_TAKE_PROFIT,
    isFeatureEnabled: isAutoTakeProfitEnabled,
  })

  const {
    isStopLossAvailable,
    isAutoSellAvailable,
    isAutoBuyAvailable,
    isConstantMultipleAvailable,
    isTakeProfitAvailable,
  } = getAvailableAutomation(protocol)

  const items = [
    ...(type === 'Protection'
      ? [
          ...(isStopLossAvailable ? [stopLossDropdownItem] : []),
          ...(!isAutoConstantMultipleEnabled && isAutoSellAvailable ? [autoSellDropdownItem] : []),
        ]
      : []),
    ...(type === 'Optimization'
      ? [
          ...(!isAutoConstantMultipleEnabled && isAutoBuyAvailable ? [basicBuyDropdownItem] : []),
          ...(vaultType === VaultType.Multiply && isConstantMultipleAvailable
            ? [constantMultipleDropdownItem]
            : []),
          ...(isTakeProfitAvailable ? [autoTakeProfitDropdownItem] : []),
        ]
      : []),
  ]

  return items.length > 1
    ? {
        forcePanel,
        disabled,
        items,
      }
    : undefined
}
