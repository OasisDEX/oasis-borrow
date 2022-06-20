import { SetupBanner, setupBannerGradientPresets } from 'components/vault/SetupBanner'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'

import { useSessionStorage } from '../../../../helpers/useSessionStorage'
import { StopLossTriggeredBannerLayout } from './StopLossTriggeredBannerLayout'

export function StopLossTriggeredBannerControl() {
  const { t } = useTranslation()
  const [isBannerClosed, setIsBannerClosed] = useSessionStorage('stopLossTriggeredBanner', false)
  const handleClose = useCallback(() => setIsBannerClosed(true), [])
  const newComponentsEnabled = useFeatureToggle('NewComponents')

  return (
    <>
      {!isBannerClosed && (
        <>
          {!newComponentsEnabled ? (
            <StopLossTriggeredBannerLayout handleClose={handleClose} />
          ) : (
            <SetupBanner
              header={t('protection.stop-loss-triggered')}
              content={t('protection.stop-loss-triggered-content')}
              button={t('close-notification')}
              backgroundImage="/static/img/setup-banner/stop-loss-triggered.svg"
              backgroundColor={setupBannerGradientPresets.stopLoss[0]}
              backgroundColorEnd={setupBannerGradientPresets.stopLoss[1]}
              handleClick={handleClose}
            />
          )}
        </>
      )}
    </>
  )
}
