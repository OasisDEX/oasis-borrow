import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance, formatPercent } from '../helpers/formatters/format'
import { ProductCardData, productCardsConfig } from '../helpers/productCards'
import { roundToThousand } from '../helpers/roundToThousand'
import { one } from '../helpers/zero'
import { ProductCard } from './ProductCard'

function bannerValues(liquidationRatio: BigNumber, currentCollateralPrice: BigNumber) {
  const maxBorrowDisplayAmount = new BigNumber(250000)
  const minBorrowDisplayAmount = new BigNumber(150000)

  const singleTokenMaxBorrow = one.div(liquidationRatio).multipliedBy(currentCollateralPrice)

  if (singleTokenMaxBorrow.gt(maxBorrowDisplayAmount)) {
    const tokenAmount = maxBorrowDisplayAmount.div(singleTokenMaxBorrow)

    const roundedTokenAmount = new BigNumber(tokenAmount.multipliedBy(10000).toFixed(4, 3)).div(
      10000,
    )

    return {
      maxBorrow: formatCryptoBalance(
        roundToThousand(roundedTokenAmount.multipliedBy(singleTokenMaxBorrow)),
      ),
      tokenAmount: formatCryptoBalance(roundedTokenAmount),
    }
  }

  if (singleTokenMaxBorrow.lt(minBorrowDisplayAmount)) {
    const tokenAmount = minBorrowDisplayAmount.div(singleTokenMaxBorrow)

    const roundedTokenAmount = new BigNumber(tokenAmount.toFixed(0, 2))

    return {
      maxBorrow: formatCryptoBalance(
        roundToThousand(roundedTokenAmount.multipliedBy(singleTokenMaxBorrow)),
      ),
      tokenAmount: formatCryptoBalance(roundedTokenAmount),
    }
  }

  return {
    maxBorrow: formatCryptoBalance(singleTokenMaxBorrow),
    tokenAmount: formatCryptoBalance(one),
  }
}

export function ProductCardBorrow(props: { cardData: ProductCardData }) {
  const { t } = useTranslation()
  const { cardData } = props

  const { maxBorrow, tokenAmount } = bannerValues(
    cardData.liquidationRatio,
    cardData.currentCollateralPrice,
  )

  const tagKey = productCardsConfig.borrow.tags[cardData.ilk]

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
          value: tokenAmount,
          token: cardData.token,
        }),
        description: t(`product-card-banner.borrow`, {
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
      floatingLabelText={tagKey ? t(`product-card.tags.${tagKey}`) : ''}
    />
  )
}
