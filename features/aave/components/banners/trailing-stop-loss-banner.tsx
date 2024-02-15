import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { AppLink } from 'components/Links'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function TrailingStopLossBanner({ buttonClicked }: { buttonClicked: () => void }) {
  const { t } = useTranslation()

  return (
    <Banner
      title={t('vault-banners.setup-trailing-stop-loss.header')}
      description={
        <>
          {t('vault-banners.setup-trailing-stop-loss.content')}{' '}
          <AppLink href={'#'} sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </>
      }
      image={{
        src: '/static/img/setup-banner/trailing-stop-loss.svg',
        backgroundColor: bannerGradientPresets.trailingStopLoss[0],
        backgroundColorEnd: bannerGradientPresets.trailingStopLoss[1],
      }}
      button={{
        action: () => {
          buttonClicked()
        },
        text: t('vault-banners.setup-trailing-stop-loss.button'),
      }}
    />
  )
}
