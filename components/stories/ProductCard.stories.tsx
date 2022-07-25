import { useTranslation } from 'next-i18next'
import EthGif from 'public/static/img/tokens/eth.gif'
import EthImage from 'public/static/img/tokens/eth.png'
import React from 'react'

import { ProductCard, ProductCardProtocolLink } from '../productCards/ProductCard'

export const Borrow = () => {
  const { t } = useTranslation()

  return (
    <ProductCard
      tokenImage={EthImage}
      tokenGif={EthGif}
      title="Maker ETH Vault"
      description={t(`product-card.borrow`, { token: 'ETH' })}
      banner={{
        title: t('product-card-banner.with', { value: '100', token: 'ETH' }),
        description: t(`product-card-banner.borrow`, {
          value: '280,000',
        }),
      }}
      labels={[
        { title: t('system.min-coll-ratio'), value: '50%' },
        { title: t('system.liquidity-available'), value: '40.5M' },
        { title: t('system.stability-fee'), value: '2.0%' },
        { title: t('system.protocol'), value: <ProductCardProtocolLink ilk={'ETH-A'} /> },
      ]}
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
      title="Maker ETH Vault"
      description={t(`product-card.multiply`, { token: 'ETH' })}
      banner={{
        title: t('product-card-banner.with', { value: '100', token: 'ETH' }),
        description: t(`product-card-banner.multiply`, {
          value: '330',
          token: 'ETH',
        }),
      }}
      labels={[
        { title: t('system.max-multiple'), value: '3x' },
        { title: t('system.liquidity-available'), value: '40.5M' },
        { title: t('system.stability-fee'), value: '2.0%' },
        { title: t('system.protocol'), value: <ProductCardProtocolLink ilk={'ETH-A'} /> },
      ]}
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
