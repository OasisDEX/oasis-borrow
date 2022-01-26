import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance, formatPercent } from '../helpers/formatters/format'
import { cardDescriptionsKeys, ProductCardData, productCardsConfig } from '../helpers/productCards'
import { one } from '../helpers/zero'
import { ProductCard } from './ProductCard'

function bannerValues(liquidationRatio: BigNumber, currentCollateralPrice: BigNumber) {
  const hardcodedTokenAmount = one
  const maxBorrowDisplayAmount = new BigNumber(1000000)

  const maxBorrowAmount = one
    .div(liquidationRatio)
    .multipliedBy(currentCollateralPrice.times(hardcodedTokenAmount))

  // this condition handles cases for LP tokens with very high conversion ratio
  if (maxBorrowAmount.gt(maxBorrowDisplayAmount)) {
    const hardcodedMaxBorrow = new BigNumber(250000)
    const tokenFraction = hardcodedMaxBorrow.div(maxBorrowAmount)

    return {
      maxBorrow: formatCryptoBalance(hardcodedMaxBorrow),
      tokenAmount: tokenFraction.toFixed(4),
    }
  }

  return {
    maxBorrow: formatCryptoBalance(maxBorrowAmount),
    tokenAmount: hardcodedTokenAmount.toFixed(0),
  }
}

export function ProductCardBorrow(props: { cardData: ProductCardData }) {
  const { t } = useTranslation()
  const { cardData } = props

  const { maxBorrow, tokenAmount } = bannerValues(
    cardData.liquidationRatio,
    cardData.currentCollateralPrice,
  )

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
          value: tokenAmount,
          token: cardData.token,
        }),
        description: t(`product-card-banner.borrow.description`, {
          value: maxBorrow,
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
      inactive={productCardsConfig.borrow.inactiveIlks.includes(cardData.ilk)}
      isFull={cardData.isFull}
    />
  )
}
