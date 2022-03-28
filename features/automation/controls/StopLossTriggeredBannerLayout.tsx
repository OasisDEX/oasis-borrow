import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import React from 'react'
import { Box } from 'theme-ui'

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
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            opacity: [0.4, 1],
            width: '281px',
            height: '168px',
          }}
        >
          <Image
            src={staticFilesRuntimeUrl('/static/img/stop_loss_triggered.svg')}
            width="281px"
            height="168px"
            layout="responsive"
          />
        </Box>
      }
    />
  )
}
