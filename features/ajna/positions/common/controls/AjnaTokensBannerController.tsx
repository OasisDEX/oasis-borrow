import { Banner } from 'components/Banner'
import { AppLink } from 'components/Links'
import type { ProtocolFlow } from 'features/ajna/common/types'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useRedirect } from 'helpers/useRedirect'
import { Trans, useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface AjnaTokensBannerControllerProps {
  flow: ProtocolFlow
  isPriceBelowLup?: boolean // used only in earn product
}

const PriceBelowLupDescription = () => (
  <Trans
    i18nKey="ajna.position-page.common.banners.tokens.description-manage-below-lup"
    components={{
      1: <strong />,
      2: (
        <AppLink
          href={EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_PICK_LENDING_PRICE}
          sx={{ display: 'inline-block' }}
        />
      ),
    }}
  />
)

export const AjnaTokensBannerController: FC<AjnaTokensBannerControllerProps> = ({
  flow,
  isPriceBelowLup = false,
}) => {
  const { t } = useTranslation()
  const { push } = useRedirect()

  return (
    <Banner
      title={
        isPriceBelowLup
          ? t('ajna.position-page.common.banners.tokens.title-below-lup')
          : t('ajna.position-page.common.banners.tokens.title')
      }
      description={
        flow === 'open' ? (
          t('ajna.position-page.common.banners.tokens.description-open')
        ) : isPriceBelowLup ? (
          <PriceBelowLupDescription />
        ) : (
          t('ajna.position-page.common.banners.tokens.description-manage')
        )
      }
      image={{
        src: '/static/img/ajna-tokens-banner.svg',
        backgroundColor: '#FFEBF6',
        spacing: '12px',
      }}
      button={{
        text:
          flow === 'open'
            ? t('ajna.position-page.common.banners.tokens.button-open')
            : t('ajna.position-page.common.banners.tokens.button-manage'),
        action: () => push(INTERNAL_LINKS.ajnaRewards),
      }}
    />
  )
}
