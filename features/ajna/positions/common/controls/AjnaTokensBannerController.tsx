import { Banner } from 'components/Banner'
import { AjnaFlow } from 'features/ajna/common/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React, { FC } from 'react'

interface AjnaTokensBannerControllerProps {
  flow: AjnaFlow
}

export const AjnaTokensBannerController: FC<AjnaTokensBannerControllerProps> = ({ flow }) => {
  const { t } = useTranslation()
  const { push } = useRedirect()

  return (
    <Banner
      title={t('ajna.position-page.common.banners.tokens.title')}
      description={
        flow === 'open'
          ? t('ajna.position-page.common.banners.tokens.description-open')
          : t('ajna.position-page.common.banners.tokens.description-manage')
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
