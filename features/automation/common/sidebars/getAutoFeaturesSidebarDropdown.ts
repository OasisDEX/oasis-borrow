import { useAppContext } from 'components/AppContextProvider'
import { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationKinds,
  AutomationOptimizationFeatures,
  AutomationProtectionFeatures,
} from 'features/automation/common/state/automationFeatureChange'
import { useTranslation } from 'next-i18next'

interface GetAutoFeaturesSidebarDropdownProps {
  type: AutomationKinds
  forcePanel: AutomationProtectionFeatures | AutomationOptimizationFeatures
  disabled?: boolean
  isStopLossEnabled?: boolean
  isAutoSellEnabled?: boolean
  isAutoBuyEnabled?: boolean
  isAutoConstantMultipleEnabled?: boolean
  isAutoTakeProfitEnabled?: boolean
}
interface GetAutoFeaturesSidebarDropdownItemProps {
  translationKey: string
  type: AutomationKinds
  panel: AutomationProtectionFeatures | AutomationOptimizationFeatures
  isFeatureEnabled?: boolean
}

function getAutoFeaturesSidebarDropdownItem({
  translationKey,
  type,
  panel,
  isFeatureEnabled,
}: GetAutoFeaturesSidebarDropdownItemProps): SidebarSectionHeaderSelectItem {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

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
}: GetAutoFeaturesSidebarDropdownProps): SidebarSectionHeaderDropdown | undefined {
  const stopLossDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.stop-loss',
    type: 'Protection',
    panel: 'stopLoss',
    isFeatureEnabled: isStopLossEnabled,
  })
  const autoSellDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.basic-sell',
    type: 'Protection',
    panel: 'autoSell',
    isFeatureEnabled: isAutoSellEnabled,
  })
  const basicBuyDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.basic-buy',
    type: 'Optimization',
    panel: 'autoBuy',
    isFeatureEnabled: isAutoBuyEnabled,
  })
  const constantMultipleDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.constant-multiple',
    type: 'Optimization',
    panel: 'constantMultiple',
    isFeatureEnabled: isAutoConstantMultipleEnabled,
  })
  const autoTakeProfitDropdownItem = getAutoFeaturesSidebarDropdownItem({
    translationKey: 'system.auto-take-profit',
    type: 'Optimization',
    panel: 'autoTakeProfit',
    isFeatureEnabled: isAutoTakeProfitEnabled,
  })

  const items = [
    ...(type === 'Protection'
      ? [stopLossDropdownItem, ...(!isAutoConstantMultipleEnabled ? [autoSellDropdownItem] : [])]
      : []),
    ...(type === 'Optimization'
      ? [
          ...(!isAutoConstantMultipleEnabled ? [basicBuyDropdownItem] : []),
          constantMultipleDropdownItem,
          ...(!isAutoTakeProfitEnabled ? [autoTakeProfitDropdownItem] : []),
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
