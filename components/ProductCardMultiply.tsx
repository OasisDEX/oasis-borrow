import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance, formatPercent } from '../helpers/formatters/format'
import { ProductCardData, productCardsConfig } from '../helpers/productCards'
import { one } from '../helpers/zero'
import { ProductCard } from './ProductCard'

function calculatePersonalisedValues(
  productCardData: ProductCardData,
  roundedMaxMultiple: BigNumber,
) {
  const { currentCollateralPrice, balance, debtFloor } = productCardData
  const balanceAboveDebtFloor = balance?.gt(debtFloor.div(currentCollateralPrice))

  let roundedTokenAmount = new BigNumber(0)
  if (balanceAboveDebtFloor) {
    roundedTokenAmount = new BigNumber(balance!.toFixed(0, 3))
  }
  if (!balanceAboveDebtFloor) {
    roundedTokenAmount = new BigNumber(debtFloor.div(currentCollateralPrice).toFixed(0, 3))
  }

  return {
    tokenAmount: roundedTokenAmount,
    exposure: roundedTokenAmount.multipliedBy(roundedMaxMultiple),
  }
}

function bannerValues(props: ProductCardData & { maxMultiple: BigNumber }) {
  const { maxMultiple, currentCollateralPrice, balance } = props
  const dollarWorthInputColllateral = new BigNumber(150000)
  const tokenAmount = dollarWorthInputColllateral.div(currentCollateralPrice)
  const roundedMaxMultiple = new BigNumber(maxMultiple.toFixed(2, 3))
  const roundedTokenAmount = new BigNumber(tokenAmount.toFixed(0, 3))

  if (balance) {
    return calculatePersonalisedValues(props, roundedMaxMultiple)
  }

  return {
    tokenAmount: roundedTokenAmount,
    exposure: roundedTokenAmount.multipliedBy(roundedMaxMultiple),
  }
}

export function ProductCardMultiply(props: { cardData: ProductCardData }) {
  const { t } = useTranslation()
  const { cardData } = props

  const isGuniToken = cardData.token === 'GUNIV3DAIUSDC2'
  const maxMultiple = !isGuniToken
    ? one.plus(one.div(cardData.liquidationRatio.minus(one)))
    : one.div(cardData.liquidationRatio.minus(one))

  const { tokenAmount, exposure } = bannerValues({ ...cardData, maxMultiple })

  const tagKey = productCardsConfig.multiply.tags[cardData.ilk]

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
          value: isGuniToken ? '100,000' : formatCryptoBalance(tokenAmount),
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
      leftSlot={{
        title: t('system.max-multiple'),
        value: `${maxMultiple.toFixed(2, 1)}x`,
      }}
      rightSlot={{
        title: t(t('system.variable-annual-fee')),
        value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
      }}
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
