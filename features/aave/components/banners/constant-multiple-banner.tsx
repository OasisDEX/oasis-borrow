import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export function ConstantMultipleBanner({ buttonClicked }: { buttonClicked: () => void }) {
  const { t } = useTranslation()
  const isconstantMultipleEnabled = false

  return (
    <Banner
      title={t('constant-multiple.banner.header')}
      description={[
        <>
          {t('constant-multiple.banner.content')}{' '}
          <AppLink href={EXTERNAL_LINKS.KB.AUTO_BUY_SELL} sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </>,
        ...(isconstantMultipleEnabled
          ? [
              <Text as="span" sx={{ color: 'primary100', fontWeight: 'semiBold' }}>
                {t('constant-multiple.banner.cm-warning')}
              </Text>,
            ]
          : []),
      ]}
      image={{
        src: '/static/img/setup-banner/constant-multiply.svg',
        backgroundColor: bannerGradientPresets.autoBuy[0],
        backgroundColorEnd: bannerGradientPresets.autoBuy[1],
      }}
      button={{
        action: () => {
          buttonClicked()
        },
        text: t('constant-multiple.banner.button'),
        disabled: isconstantMultipleEnabled,
      }}
    />
  )
}
