import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance, formatPercent } from '../../helpers/formatters/format'
import { ProductCardData, productCardsConfig } from '../../helpers/productCards'
import { one, zero } from '../../helpers/zero'
import { calculateTokenAmount, ProductCard, ProductCardProtocolLink } from './ProductCard'

function personaliseCardData({
  productCardData,
  roundedMaxMultiple,
}: {
  productCardData: ProductCardData
  roundedMaxMultiple: BigNumber
}) {
  const { roundedTokenAmount } = calculateTokenAmount(productCardData)

  return {
    ...calculateTokenAmount(productCardData),
    exposure: roundedTokenAmount.multipliedBy(roundedMaxMultiple),
  }
}

function bannerValues(props: ProductCardData, maxMultiple: BigNumber) {
  const { currentCollateralPrice, balance } = props

  const dollarWorthInputColllateral = new BigNumber(150_000)
  const tokenAmount = dollarWorthInputColllateral.div(currentCollateralPrice)
  const roundedMaxMultiple = new BigNumber(maxMultiple.toFixed(2, 3))
  const roundedTokenAmount = new BigNumber(tokenAmount.toFixed(0, 3))

  if (balance?.gt(zero)) {
    return personaliseCardData({ productCardData: props, roundedMaxMultiple })
  }

  return {
    tokenAmount: formatCryptoBalance(roundedTokenAmount),
    exposure: roundedTokenAmount.multipliedBy(roundedMaxMultiple),
  }
}

export function ProductCardMultiply(props: { cardData: ProductCardData }) {
  const { t } = useTranslation()
  const { cardData } = props

  const isGuniToken = cardData.token === 'GUNIV3DAIUSDC2' || cardData.token === 'GUNIV3DAIUSDC1'
  const maxMultiple = !isGuniToken
    ? one.plus(one.div(cardData.liquidationRatio.minus(one)))
    : one.div(cardData.liquidationRatio.minus(one))

  const { tokenAmount, exposure } = bannerValues(cardData, maxMultiple)

  const tagKey = productCardsConfig.multiply.tags[cardData.ilk]

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
          value: isGuniToken ? formatCryptoBalance(new BigNumber(100_000)) : tokenAmount,
          token: isGuniToken ? 'DAI' : cardData.token,
        }),
        description: !isGuniToken
          ? t(`product-card-banner.multiply`, {
              value: formatCryptoBalance(exposure),
              token: cardData.token,
            })
          : t(`product-card-banner.guni`, {
              value: formatCryptoBalance(maxMultiple.times(100000)),
              token: cardData.token,
            }),
      }}
      labels={[
        {
          title: t('system.max-multiple'),
          value: `${maxMultiple.toFixed(2, 1)}x`,
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
      button={{
        link: `/vaults/open-multiply/${cardData.ilk}`,
        text: t('nav.multiply'),
      }}
      background={cardData.background}
      inactive={productCardsConfig.multiply.inactiveIlks.includes(cardData.ilk)}
      isFull={cardData.isFull}
      floatingLabelText={tagKey ? t(`product-card.tags.${tagKey}`, { token: cardData.token }) : ''}
    />
  )
}
