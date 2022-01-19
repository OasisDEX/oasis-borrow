import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatPercent } from '../helpers/formatters/format'
import { ProductCardData } from '../helpers/productCards'
import { one } from '../helpers/zero'
import { ProductCard } from './ProductCard'

const hardcodedTokenAmount = 1

export function ProductCardBorrow(props: { cardData: ProductCardData }) {
  const { t } = useTranslation()
  const { cardData } = props
  const maxBorrowAmount = new BigNumber(
    one
      .div(cardData.liquidationRatio)
      .multipliedBy(cardData.currentCollateralPrice.times(hardcodedTokenAmount)),
  ).toFixed(0)

  return (
    <ProductCard
      key={cardData.ilk}
      tokenImage={cardData.bannerIcon}
      tokenGif={cardData.bannerGif}
      title={cardData.ilk}
      description={t(`product-card.borrow.description`, { token: cardData.token })}
      banner={{
        title: t('product-card-banner.with', {
          value: hardcodedTokenAmount,
          token: cardData.token,
        }),
        description: t(`product-card-banner.borrow.description`, {
          value: maxBorrowAmount,
        }),
      }}
      leftSlot={{
        title: t('system.min-coll-ratio'),
        value: `${formatPercent(cardData.liquidationRatio.times(100), {
          precision: 2,
        })}`,
      }}
      rightSlot={{
        title: t(t('system.stability-fee')),
        value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
      }}
      button={{ link: `/vaults/open/${cardData.ilk}`, text: t('nav.borrow') }}
      background={cardData.background}
    />
  )
}
