import BigNumber from 'bignumber.js'
import { AaveReserveConfigurationData } from 'blockchain/calls/aaveProtocolDataProvider'
import { TokenMetadataType } from 'blockchain/tokensMetadata'
import { AaveStEthYieldsResponse, calculateSimulation } from 'features/earn/aave/open/services'
import { AppSpinner } from 'helpers/AppSpinner'
import { formatHugeNumbersToShortHuman, formatPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

import { ProductCard, ProductCardProtocolLink } from './ProductCard'

type ProductCardEarnAaveProps = {
  cardData: TokenMetadataType
  aaveReserveState?: AaveReserveConfigurationData
  aaveSthEthYieldsQuery: (multiply: BigNumber) => Promise<AaveStEthYieldsResponse>
  availableLiquidity: BigNumber
}

const aaveCalcValueBasis = {
  amount: new BigNumber(100),
  token: 'ETH',
}

export function ProductCardEarnAave({
  cardData,
  aaveReserveState,
  aaveSthEthYieldsQuery,
  availableLiquidity,
}: ProductCardEarnAaveProps) {
  const { t } = useTranslation()
  const [simulations, setSimulations] = useState<ReturnType<typeof calculateSimulation>>()
  const maximumMultiple = one.div(one.minus(aaveReserveState!.ltv))

  useEffect(() => {
    void (async () => {
      setSimulations(
        calculateSimulation({
          ...aaveCalcValueBasis,
          yields: await aaveSthEthYieldsQuery(maximumMultiple),
          multiply: maximumMultiple,
        }),
      )
    })()
  }, [])

  return (
    <ProductCard
      tokenImage={cardData.bannerIcon}
      tokenGif={cardData.bannerGif}
      title={t(`product-card.aave.${cardData.symbol}.title`)}
      description={t(`product-card.aave.${cardData.symbol}.description`)}
      banner={{
        title: t('product-card-banner.with', {
          value: aaveCalcValueBasis.amount.toString(),
          token: aaveCalcValueBasis.token,
        }),
        description: t(`product-card-banner.aave.${cardData.symbol}`, {
          value: maximumMultiple.times(aaveCalcValueBasis.amount).toFormat(0),
          token: cardData.symbol,
        }),
      }}
      labels={[
        {
          title: '7 day net APY',
          value: simulations ? (
            // this takes a while, so we show a spinner until it's ready
            formatPercent(simulations?.previous7Days.earningAfterFees, {
              precision: 2,
            })
          ) : (
            <AppSpinner />
          ),
        },
        {
          title: '90 day net APY',
          value: simulations ? (
            formatPercent(simulations?.previous90Days.earningAfterFees, {
              precision: 2,
            })
          ) : (
            <AppSpinner />
          ),
        },
        {
          title: 'Current Liquidity Available',
          value: formatHugeNumbersToShortHuman(availableLiquidity),
        },
        {
          title: t('system.protocol'),
          value: <ProductCardProtocolLink ilk={cardData.symbol} />,
        },
      ]}
      button={{
        link: `/earn/open/${cardData.symbol.toLocaleLowerCase()}`,
        text: t('nav.earn'),
      }}
      background={cardData.background}
      isFull={false}
    />
  )
}
