import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export function AutoBuyBanner({ buttonClicked }: { buttonClicked: () => void }) {
  const { t } = useTranslation()
  const isconstantMultipleEnabled = false

  return (
    <Banner
      title={t('auto-buy.banner.header')}
      description={[
        <>
          {t('auto-buy.banner.content')}{' '}
          <AppLink href={EXTERNAL_LINKS.KB.AUTO_BUY_SELL} sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </>,
        ...(isconstantMultipleEnabled
          ? [
              <Text as="span" sx={{ color: 'primary100', fontWeight: 'semiBold' }}>
                {t('auto-buy.banner.cm-warning')}
              </Text>,
            ]
          : []),
      ]}
      image={{
        src: '/static/img/setup-banner/auto-buy.svg',
        backgroundColor: bannerGradientPresets.autoBuy[0],
        backgroundColorEnd: bannerGradientPresets.autoBuy[1],
      }}
      button={{
        action: () => {
          buttonClicked()
        },
        text: t('auto-buy.banner.button'),
        disabled: isconstantMultipleEnabled,
      }}
    />
  )
}
