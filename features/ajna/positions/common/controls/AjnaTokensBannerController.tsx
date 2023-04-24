import { Banner } from 'components/Banner'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaTokensBannerController() {
  const { t } = useTranslation()
  const { push } = useRedirect()

  return (
    <Banner
      title={t('ajna.position-page.common.banners.tokens.title')}
      description={t('ajna.position-page.common.banners.tokens.description')}
      image={{
        src: '/static/img/ajna-tokens-banner.svg',
        backgroundColor: '#FFEBF6',
        spacing: '12px',
      }}
      button={{
        text: t('ajna.position-page.common.banners.tokens.button'),
        action: () => push(INTERNAL_LINKS.ajnaRewards),
      }}
    />
  )
}
