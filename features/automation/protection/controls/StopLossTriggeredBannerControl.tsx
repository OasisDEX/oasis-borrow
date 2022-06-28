import { Banner, bannerGradientPresets } from 'components/Banner'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'

import { useSessionStorage } from '../../../../helpers/useSessionStorage'

export function StopLossTriggeredBannerControl() {
  const { t } = useTranslation()
  const [isBannerClosed, setIsBannerClosed] = useSessionStorage('stopLossTriggeredBanner', false)
  const handleClose = useCallback(() => setIsBannerClosed(true), [])

  return (
    <>
      {!isBannerClosed && (
        <Banner
          title={t('protection.stop-loss-triggered')}
          description={t('protection.stop-loss-triggered-content')}
          image={{
            src: '/static/img/setup-banner/stop-loss-triggered.svg',
            backgroundColor: bannerGradientPresets.stopLoss[0],
            backgroundColorEnd: bannerGradientPresets.stopLoss[1],
          }}
          button={{
            action: handleClose,
            text: t('close-notification'),
          }}
        />
      )}
    </>
  )
}
