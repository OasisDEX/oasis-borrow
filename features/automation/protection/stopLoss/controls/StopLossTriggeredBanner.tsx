import { bannerGradientPresets } from 'components/Banner'
import { AutomationTriggeredBannerControl } from 'features/automation/common/controls/AutomationTriggeredBannerControl'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function StopLossTriggeredBanner() {
  const { t } = useTranslation()
  const feature = t('protection.stop-loss')

  return (
    <AutomationTriggeredBannerControl
      sessionStorageKey="stopLossTriggeredBanner"
      title={t('automation.trigger-executed-banner-title', { feature })}
      description={t('automation.trigger-executed-banner-description', { feature })}
      image={{
        src: '/static/img/setup-banner/stop-loss-triggered.svg',
        backgroundColor: bannerGradientPresets.stopLoss[0],
        backgroundColorEnd: bannerGradientPresets.stopLoss[1],
      }}
    />
  )
}
