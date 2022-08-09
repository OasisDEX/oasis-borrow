import { UIChanges } from 'components/AppContext'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { TFunction } from 'next-i18next'

export function commonOptimizationDropdownItems(uiChanges: UIChanges, t: TFunction) {
  return [
    {
      label: t('system.basic-buy'),
      iconShrink: 2,
      icon: 'circle_exchange',
      panel: 'autoBuy',
      action: () => {
        uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
          type: 'Optimization',
          currentOptimizationFeature: 'autoBuy',
        })
      },
    },
    {
      label: t('system.constant-multiple'),
      iconShrink: 2,
      icon: 'circle_exchange',
      panel: 'constantMultiple',
      action: () => {
        uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
          type: 'Optimization',
          currentOptimizationFeature: 'constantMultiple',
        })
      },
    },
  ]
}
