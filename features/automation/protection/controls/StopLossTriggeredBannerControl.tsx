import { SetupBanner, setupBannerGradientPresets } from 'components/vault/SetupBanner'
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
        <>
          <SetupBanner
            header={t('protection.stop-loss-triggered')}
            content={t('protection.stop-loss-triggered-content')}
            button={t('close-notification')}
            backgroundImage="/static/img/setup-banner/stop-loss-triggered.svg"
            backgroundColor={setupBannerGradientPresets.stopLoss[0]}
            backgroundColorEnd={setupBannerGradientPresets.stopLoss[1]}
            handleClick={handleClose}
          />
        </>
      )}
    </>
  )
}
