import { UIChanges } from 'components/AppContext'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { TFunction } from 'next-i18next'

export function commonProtectionDropdownItems(uiChanges: UIChanges, t: TFunction) {
  return [
    {
      label: t('system.stop-loss'),
      shortLabel: t('system.stop-loss'),
      iconShrink: 3,
      icon: 'circle_exchange',
      panel: 'stopLoss',
      action: () => {
        uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
          type: 'Protection',
          currentProtectionFeature: 'stopLoss',
        })
      },
    },
    {
      label: t('system.basic-sell'),
      shortLabel: t('system.basic-sell'),
      iconShrink: 3,
      icon: 'circle_exchange',
      panel: 'autoSell',
      action: () => {
        uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
          type: 'Protection',
          currentProtectionFeature: 'autoSell',
        })
      },
    },
  ]
}
