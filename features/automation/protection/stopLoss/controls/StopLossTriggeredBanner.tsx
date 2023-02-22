import { bannerGradientPresets } from 'components/Banner'
import { AppLink } from 'components/Links'
import { AutomationTriggeredBannerControl } from 'features/automation/common/controls/AutomationTriggeredBannerControl'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

interface StopLossTriggeredBannerProps {
  descriptionKey?: string
}

export function StopLossTriggeredBanner({
  descriptionKey = 'automation.trigger-executed-banner-description',
}: StopLossTriggeredBannerProps) {
  const { t } = useTranslation()
  const feature = t('protection.stop-loss')

  return (
    <AutomationTriggeredBannerControl
      sessionStorageKey="stopLossTriggeredBanner"
      title={t('automation.trigger-executed-banner-title', { feature })}
      description={
        <Trans
          i18nKey={descriptionKey}
          values={{ feature }}
          components={[
            <AppLink
              sx={{ fontSize: 'inherit' }}
              href="https://kb.oasis.app/help/how-does-automated-stop-loss-work"
            />,
          ]}
        />
      }
      image={{
        src: '/static/img/setup-banner/stop-loss-triggered.svg',
        backgroundColor: bannerGradientPresets.stopLoss[0],
        backgroundColorEnd: bannerGradientPresets.stopLoss[1],
      }}
    />
  )
}
