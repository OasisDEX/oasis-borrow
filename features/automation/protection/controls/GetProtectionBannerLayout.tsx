import { useTranslation } from 'next-i18next'
import React from 'react'
import { Image } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../../../../helpers/staticPaths'
import { ProtectionBanner } from '../common/ProtectionBanner'

interface GetProtectionBannerLayoutProps {
  handleClick: () => void
  handleClose: () => void
}

export function GetProtectionBannerLayout({
  handleClick,
  handleClose,
}: GetProtectionBannerLayoutProps) {
  const { t } = useTranslation()

  return (
    <ProtectionBanner
      handleClick={handleClick}
      handleClose={handleClose}
      heading={t('protection.banner-header')}
      description={t('protection.banner-content')}
      buttonText={t('protection.banner-button')}
      buttonSx={{
        backgroundColor: 'selected',
        '&:hover': { backgroundColor: 'fogBlue' },
        maxWidth: '168px',
        zIndex: 1,
      }}
      image={
        <Image
          src={staticFilesRuntimeUrl('/static/img/automation.svg')}
          sx={{ position: 'absolute', right: 0, top: 0, opacity: [0.4, 1] }}
        />
      }
    />
  )
}
