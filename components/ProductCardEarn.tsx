import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance, formatPercent } from '../helpers/formatters/format'
import { ProductCardData, productCardsConfig } from '../helpers/productCards'
import { one } from '../helpers/zero'
import { ProductCard } from './ProductCard'

interface ProductCardEarnProps {
  cardData: ProductCardData
}

export function ProductCardEarn({ cardData }: ProductCardEarnProps) {
  const { t } = useTranslation()

  const maxMultiple = one.div(cardData.liquidationRatio.minus(one))
  const tagKey = productCardsConfig.earn.tags[cardData.ilk]
  const sevenDayAverage = new BigNumber(0.1201) // TODO to be replaced with calculations

  return (
    <ProductCard
      key={cardData.ilk}
      tokenImage={cardData.bannerIcon}
      tokenGif={cardData.bannerGif}
      title={cardData.ilk}
      description={t(`product-card.${productCardsConfig.descriptionCustomKeys[cardData.ilk]}`, {
        token: cardData.token,
      })}
      banner={{
        title: t('product-card-banner.with', {
          value: '100,000',
          token: 'DAI',
        }),
        description: t(`product-card-banner.guni`, {
          value: formatCryptoBalance(maxMultiple.times(100000)),
          token: cardData.token,
        }),
      }}
      leftSlot={{
        title: t('system.seven-day-average'),
        value: formatPercent(sevenDayAverage.times(100), { precision: 2 }),
      }}
      rightSlot={{
        title: t(t('system.variable-annual-fee')),
        value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
      }}
      button={{
        // TODO to be replaced with open-earn in the future
        link: `/vaults/open-multiply/${cardData.ilk}`,
        text: t('nav.earn'),
      }}
      background={cardData.background}
      inactive={productCardsConfig.earn.inactiveIlks.includes(cardData.ilk)}
      isFull={cardData.isFull}
      floatingLabelText={tagKey ? t(`product-card.tags.${tagKey}`, { token: cardData.token }) : ''}
    />
  )
}
