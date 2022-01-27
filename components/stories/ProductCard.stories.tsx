import { useTranslation } from 'next-i18next'
import EthGif from 'public/static/img/tokens/eth.gif'
import EthImage from 'public/static/img/tokens/eth.png'
import React from 'react'

import { ProductCard } from '../ProductCard'

export const Borrow = () => {
  const { t } = useTranslation()

  return (
    <ProductCard
      tokenImage={EthImage}
      tokenGif={EthGif}
      title="ETH-A"
      description={t(`product-card.borrow.description`, { token: 'ETH' })}
      banner={{
        title: t('product-card-banner.with', { value: '100', token: 'ETH' }),
        description: t(`product-card-banner.borrow.description`, {
          value: '280,000',
        }),
      }}
      leftSlot={{ title: t('system.min-coll-ratio'), value: '50%' }}
      rightSlot={{ title: t(t('system.stability-fee')), value: '2.0%' }}
      background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
      button={{ link: '/vaults/open/ETH-A', text: t('nav.borrow') }}
      isFull={false}
    />
  )
}

export const Multiply = () => {
  const { t } = useTranslation()

  return (
    <ProductCard
      tokenImage={EthImage}
      tokenGif={EthGif}
      title="ETH-A"
      description={t(`product-card.multiply.description`, { token: 'ETH' })}
      banner={{
        title: t('product-card-banner.with', { value: '100', token: 'ETH' }),
        description: t(`product-card-banner.multiply.description`, {
          value: '330',
          token: 'ETH',
        }),
      }}
      leftSlot={{ title: t('system.max-multiple'), value: '3x' }}
      rightSlot={{ title: t(t('system.stability-fee')), value: '2.0%' }}
      background="linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF"
      button={{ link: '/vaults/open-multiply/ETH-A', text: t('nav.multiply') }}
      floatingLabelText="Get up to 3.3x ETH exposure"
      isFull={false}
    />
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ProductCard',
}
