import { Banner, bannerGradientPresets } from 'components/Banner'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'

import { useSessionStorage } from '../../../../helpers/useSessionStorage'

export function StopLossTriggeredBannerControl() {
  const { t } = useTranslation()
  const [isBannerClosed, setIsBannerClosed] = useSessionStorage('stopLossTriggeredBanner', false)
  const handleClose = useCallback(() => setIsBannerClosed(true), [])
  const newComponentsEnabled = useFeatureToggle('NewComponents')

  return (
    <>
      {!isBannerClosed && (
        <Banner
          title={t('protection.stop-loss-triggered')}
          description={
            !newComponentsEnabled
              ? t('protection.stop-loss-triggered-desc')
              : t('protection.stop-loss-triggered-content')
          }
          image={{
            src: '/static/img/stop_loss_triggered.svg',
            backgroundColor: bannerGradientPresets.stopLoss[0],
            backgroundColorEnd: bannerGradientPresets.stopLoss[1],
          }}
          button={
            !newComponentsEnabled
              ? {
                  action: handleClose,
                  text: t('close-notification'),
                }
              : undefined
          }
          close={handleClose}
        />
      )}
    </>
  )
}
