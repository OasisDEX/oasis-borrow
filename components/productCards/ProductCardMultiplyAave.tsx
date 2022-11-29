import BigNumber from 'bignumber.js'
import { TokenMetadataType } from 'blockchain/tokensMetadata'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { getAaveStrategy } from 'features/aave/strategyConfig'
import { AppSpinner } from 'helpers/AppSpinner'
import { displayMultiple } from 'helpers/display-multiple'
import { formatHugeNumbersToShortHuman, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ProductCard, ProductCardProtocolLink } from './ProductCard'

type ProductCardMultiplyAaveProps = {
  cardData: TokenMetadataType
}

const aaveMultiplyCalcValueBasis = {
  amount: new BigNumber(100),
  token: 'ETH',
}

export function ProductCardMultiplyAave({ cardData }: ProductCardMultiplyAaveProps) {
  const { t } = useTranslation()
  const { aaveAvailableLiquiditySTETH$, aaveReserveData } = useAaveContext()
  const [strategy] = getAaveStrategy(cardData.symbol)
  const maxMultiple = strategy.riskRatios.default.multiple // TODO: get actual value from machine
  const [aaveAvailableLiquiditySTETH] = useObservable(aaveAvailableLiquiditySTETH$)
  const [aaveReserveDataCollateral] = useObservable(aaveReserveData[strategy.tokens.collateral])

  return (
    <ProductCard
      tokenImage={cardData.bannerIcon}
      tokenGif={cardData.bannerGif}
      title={t(`product-card.aave.${cardData.symbol}.title`)}
      description={t(`product-card.aave.${cardData.symbol}.description`)}
      banner={{
        title: t('product-card-banner.with', {
          value: aaveMultiplyCalcValueBasis.amount.toString(),
          token: aaveMultiplyCalcValueBasis.token,
        }),
        description: t(`product-card-banner.aave.${cardData.symbol}`, {
          value: maxMultiple.times(aaveMultiplyCalcValueBasis.amount).toFormat(0),
          token: cardData.symbol,
        }),
      }}
      labels={[
        {
          title: t('system.max-multiple'),
          value: displayMultiple(maxMultiple),
        },
        {
          title: t('system.position'),
          value: cardData.name,
        },
        {
          title: t('system.liquidity-available'),
          value: aaveAvailableLiquiditySTETH ? (
            formatHugeNumbersToShortHuman(aaveAvailableLiquiditySTETH)
          ) : (
            <AppSpinner />
          ),
        },
        {
          title: t('system.variable-annual-fee'),
          value: aaveReserveDataCollateral?.variableBorrowRate
            ? formatPercent(aaveReserveDataCollateral.variableBorrowRate.times(100), {
                precision: 2,
              })
            : zero.toString(),
        },
        {
          title: t('system.protocol'),
          value: <ProductCardProtocolLink ilk={cardData.symbol} protocol={cardData.protocol} />,
        },
      ]}
      button={{
        link: `/multiply/aave/open/${strategy.urlSlug}`,
        text: t('nav.multiply'),
      }}
      background={cardData.background}
      protocol={cardData.protocol}
      isFull={false}
    />
  )
}
