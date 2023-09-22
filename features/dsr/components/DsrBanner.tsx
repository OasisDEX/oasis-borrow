import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function DsrBanner() {
  const { t } = useTranslation()
  const [, setHash] = useHash<string>()

  return (
    <Banner
      title={t('vault-banners.what-are-the-risks.header')}
      description={t('vault-banners.what-are-the-risks.content')}
      button={{
        text: t('vault-banners.what-are-the-risks.button'),
        action: () => {
          setHash('position-info')
        },
      }}
      image={{
        src: '/static/img/setup-banner/undimissible_banner.svg',
        backgroundColor: bannerGradientPresets.stopLoss[0],
        backgroundColorEnd: bannerGradientPresets.stopLoss[1],
      }}
      sx={{ mt: 4 }}
    />
  )
}
