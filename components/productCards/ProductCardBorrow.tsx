import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance, formatPercent } from '../../helpers/formatters/format'
import { ProductCardData, productCardsConfig } from '../../helpers/productCards'
import { roundToThousand } from '../../helpers/roundToThousand'
import { one, zero } from '../../helpers/zero'
import { calculateTokenAmount, ProductCard, ProductCardProtocolLink } from './ProductCard'

function personaliseCardData({
  productCardData,
  singleTokenMaxBorrow,
}: {
  productCardData: ProductCardData
  singleTokenMaxBorrow: BigNumber
}) {
  const { roundedTokenAmount } = calculateTokenAmount(productCardData)

  return {
    ...calculateTokenAmount(productCardData),
    maxBorrow: formatCryptoBalance(
      roundToThousand(roundedTokenAmount.multipliedBy(singleTokenMaxBorrow)),
    ),
  }
}

function makeCardData(singleTokenMaxBorrow: BigNumber) {
  const maxBorrowDisplayAmount = new BigNumber(250000)
  const minBorrowDisplayAmount = new BigNumber(150000)

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

function bannerValues(props: ProductCardData) {
  const { liquidationRatio, currentCollateralPrice, balance } = props

  const singleTokenMaxBorrow = one.div(liquidationRatio).multipliedBy(currentCollateralPrice)

  if (balance?.gt(zero)) {
    return personaliseCardData({ productCardData: props, singleTokenMaxBorrow })
  }

  return makeCardData(singleTokenMaxBorrow)
}

export function ProductCardBorrow(props: { cardData: ProductCardData }) {
  const { t } = useTranslation()
  const { cardData } = props

  const { maxBorrow, tokenAmount } = bannerValues(cardData)

  const tagKey = productCardsConfig.borrow.tags[cardData.ilk]

  const title = t(`product-card-title.${cardData.ilk}`)

  return (
    <ProductCard
      key={cardData.ilk}
      tokenImage={cardData.bannerIcon}
      tokenGif={cardData.bannerGif}
      title={title}
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
      labels={[
        {
          title: t('system.min-coll-ratio'),
          value: `${formatPercent(cardData.liquidationRatio.times(100), {
            precision: 2,
          })}`,
        },
        {
          title: t('system.liquidity-available'),
          value: `${formatCryptoBalance(cardData.liquidityAvailable)}`,
        },
        {
          title: t('system.variable-annual-fee'),
          value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
        },
        {
          title: t('system.protocol'),
          value: <ProductCardProtocolLink {...cardData}></ProductCardProtocolLink>,
        },
      ]}
      button={{ link: `/vaults/open/${cardData.ilk}`, text: t('nav.borrow') }}
      background={cardData.background}
      inactive={productCardsConfig.borrow.inactiveIlks.includes(cardData.ilk)}
      isFull={cardData.isFull}
      floatingLabelText={tagKey ? t(`product-card.tags.${tagKey}`) : ''}
    />
  )
}
