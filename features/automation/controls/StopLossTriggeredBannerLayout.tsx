import { useTranslation } from 'next-i18next'
import React from 'react'
import { Image } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../../../helpers/staticPaths'
import { ProtectionBanner } from '../common/ProtectionBanner'

interface StopLossTriggeredBannerLayoutProps {
  handleClose: () => void
}

export function StopLossTriggeredBannerLayout({ handleClose }: StopLossTriggeredBannerLayoutProps) {
  const { t } = useTranslation()

  return (
    <ProtectionBanner
      handleClose={handleClose}
      heading={t('protection.stop-loss-triggered')}
      description={t('protection.stop-loss-triggered-desc')}
      image={
        <Image
          src={staticFilesRuntimeUrl('/static/img/stop_loss_triggered.svg')}
          sx={{ position: 'absolute', right: 0, top: 0, opacity: [0.4, 1] }}
        />
      }
    />
  )
}
