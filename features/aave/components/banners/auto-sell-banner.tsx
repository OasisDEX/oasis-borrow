import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AutoSellBanner({ buttonClicked }: { buttonClicked: () => void }) {
  const { t } = useTranslation()

  return (
    <Banner
      title={t('auto-sell.banner.header')}
      description={[
        <>
          {t('auto-sell.banner.content')}{' '}
          <AppLink href={EXTERNAL_LINKS.KB.AUTO_BUY_SELL} sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </>,
      ]}
      image={{
        src: '/static/img/setup-banner/auto-sell.svg',
        backgroundColor: bannerGradientPresets.autoSell[0],
        backgroundColorEnd: bannerGradientPresets.autoSell[1],
      }}
      button={{
        action: () => {
          buttonClicked()
        },
        text: t('auto-sell.banner.button'),
        disabled: false,
      }}
    />
  )
}
