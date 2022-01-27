import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance, formatPercent } from '../helpers/formatters/format'
import { cardDescriptionsKeys, ProductCardData, productCardsConfig } from '../helpers/productCards'
import { one } from '../helpers/zero'
import { ProductCard } from './ProductCard'

export function ProductCardMultiply(props: { cardData: ProductCardData }) {
  const { t } = useTranslation()
  const { cardData } = props

  const isGuniToken = cardData.token === 'GUNIV3DAIUSDC1' || cardData.token === 'GUNIV3DAIUSDC2'
  const maxMultiple = !isGuniToken
    ? one.plus(one.div(cardData.liquidationRatio.minus(one)))
    : one.div(cardData.liquidationRatio.minus(one))

  return (
    <ProductCard
      key={cardData.ilk}
      tokenImage={cardData.bannerIcon}
      tokenGif={cardData.bannerGif}
      title={cardData.ilk}
      description={t(`product-card.${cardDescriptionsKeys[cardData.ilk]}.description`, {
        token: cardData.token,
      })}
      banner={{
        title: t('product-card-banner.with', {
          value: isGuniToken ? '100,000' : '100',
          token: isGuniToken ? 'DAI' : cardData.token,
        }),
        description: !isGuniToken
          ? t(`product-card-banner.multiply.description`, {
              value: formatCryptoBalance(maxMultiple.times(100)),
              token: cardData.token,
            })
          : t(`product-card-banner.guni.description`, {
              value: formatCryptoBalance(maxMultiple.times(100000)),
              token: cardData.token,
            }),
      }}
      leftSlot={{
        title: t('system.max-multiple'),
        value: `${maxMultiple.toFixed(2)}x`,
      }}
      rightSlot={{
        title: t(t('system.stability-fee')),
        value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
      }}
      button={{
        link: `/vaults/open-multiply/${cardData.ilk}`,
        text: t('nav.multiply'),
      }}
      background={cardData.background}
      inactive={productCardsConfig.multiply.inactiveIlks.includes(cardData.ilk)}
      isFull={cardData.isFull}
    />
  )
}
