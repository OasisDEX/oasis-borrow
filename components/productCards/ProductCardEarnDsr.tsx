
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ProductCard } from './ProductCard'




export function ProductCardEarnDsr() {
  const { t } = useTranslation()

  return (
    <ProductCard
      tokenImage=''
      tokenGif=''
      title={t(`DAI Savings Rate`)}
      description={t(`Earn on your Dai xxxxxxxxxxxxxxxxxxxxxxxx`)}
      banner={{
        title: '',
        description: '',
      }}

      button={{
        link: '',
        text: t('nav.earn'),
      }}
      background='#E0F9F0'
      protocol='dai'
      isFull={false}
    />
  )
}
