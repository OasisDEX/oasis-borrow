import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatPercent } from '../helpers/formatters/format'
import { cardDescriptionsKeys, ProductCardData } from '../helpers/productCards'
import { one } from '../helpers/zero'
import { ProductCard } from './ProductCard'

export function ProductCardMultiply(props: { cardData: ProductCardData }) {
  const { t } = useTranslation()
  const { cardData } = props

  const maxMultiple = one.plus(one.div(cardData.liquidationRatio.minus(one)))

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
          value: '100',
          token: cardData.token,
        }),
        description: t(`product-card-banner.multiply.description`, {
          value: maxMultiple.times(100).toFixed(2),
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
    />
  )
}
