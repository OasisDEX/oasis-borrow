import { Banner } from 'components/Banner'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface SparkTokensBannerControllerProps {}

export const SparkTokensBannerController: FC<SparkTokensBannerControllerProps> = () => {
  const { t } = useTranslation()

  return (
    <Banner
      title={t('aave.position-page.common.banners.tokens.title')}
      description={t('aave.position-page.common.banners.tokens.description')}
      image={{
        src: '/static/img/spark-tokens-banner.svg',
        backgroundColor: 'transparent',
        spacing: '0',
      }}
      button={{
        text: t('aave.position-page.common.banners.tokens.button'),
        action: () => open(INTERNAL_LINKS.sparkRewards, '_blank'),
      }}
    />
  )
}
