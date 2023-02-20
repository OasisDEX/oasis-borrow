import { Banner } from 'components/Banner'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaTokensBanner() {
  const { t } = useTranslation()

  return (
    <Banner
      title={t('ajna.borrow.common.banners.tokens.title')}
      description={t('ajna.borrow.common.banners.tokens.description')}
      image={{
        src: '/static/img/ajna-tokens-banner.svg',
        backgroundColor: '#FFEBF6',
        spacing: '12px',
      }}
      button={{
        text: t('ajna.borrow.common.banners.tokens.button'),
        action: () => {
          alert('Take me wherever')
        },
      }}
    />
  )
}
