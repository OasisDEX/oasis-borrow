import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function StopLossBanner({ buttonClicked }: { buttonClicked: () => void }) {
  const { t } = useTranslation()

  return (
    <Banner
      title={t('vault-banners.setup-stop-loss.header')}
      description={
        <>
          {t('vault-banners.setup-stop-loss.content-generic')}{' '}
          <AppLink href={EXTERNAL_LINKS.KB.STOP_LOSS} sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </>
      }
      image={{
        src: '/static/img/setup-banner/stop-loss.svg',
        backgroundColor: bannerGradientPresets.stopLoss[0],
        backgroundColorEnd: bannerGradientPresets.stopLoss[1],
      }}
      button={{
        action: () => {
          buttonClicked()
        },
        text: t('vault-banners.setup-stop-loss.button'),
      }}
    />
  )
}
