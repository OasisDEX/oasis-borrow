import BigNumber from 'bignumber.js'
import { AaveReserveConfigurationData } from 'blockchain/calls/aaveProtocolDataProvider'
import { TokenMetadataType } from 'blockchain/tokensMetadata'
import { PreparedAaveReserveData } from 'features/earn/aave/helpers/aavePrepareAaveTotalValueLocked'
import { calculateSimulation } from 'features/earn/aave/open/services'
import { formatHugeNumbersToShortHuman } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

import { ProductCard, ProductCardProtocolLink } from './ProductCard'

type ProductCardEarnAaveProps = {
  cardData: TokenMetadataType
  aaveReserveState?: AaveReserveConfigurationData
  tvlState: PreparedAaveReserveData
}

const aaveCalcValueBasis = {
  amount: new BigNumber(100),
  token: 'ETH',
}

export function ProductCardEarnAave({
  cardData,
  aaveReserveState,
  tvlState,
  aaveSthEthYieldsQuery,
}: ProductCardEarnAaveProps) {
  const { t } = useTranslation()
  const [yields, setYields] = useState(undefined)
  const [simulations, setSimulations] = useState<ReturnType<typeof calculateSimulation>>()
  const maximumMultiple = new BigNumber(1).div(aaveReserveState!.ltv)

  useEffect(() => {
    if (!yields) {
      void (async () => {
        setYields(await aaveSthEthYieldsQuery(maximumMultiple))
      })()
    }
    if (yields && !simulations) {
      setSimulations(
        calculateSimulation({
          ...aaveCalcValueBasis,
          yields,
          multiply: maximumMultiple,
        }),
      )
    }
  }, [yields, simulations])

  return (
    <ProductCard
      tokenImage={cardData.bannerIcon}
      tokenGif={cardData.bannerGif}
      title={t(`product-card.aave.${cardData.symbol}.title`)}
      description={t(`product-card.aave.${cardData.symbol}.description`)}
      banner={{
        title: t('product-card-banner.with', {
          value: aaveCalcValueBasis.amount.toString(),
          token: 'ETH',
        }),
        description: t(`product-card-banner.aave.${cardData.symbol}`, {
          value: maximumMultiple.times(aaveCalcValueBasis.amount).toFormat(0),
          token: cardData.symbol,
        }),
      }}
      labels={[
        {
          title: '7 day net APY',
          value: `${simulations?.previous7Days.earningAfterFees.toFormat(2)}%`,
        },
        {
          title: '90 day net APY',
          value: `${simulations?.previous90Days.earningAfterFees.toFormat(2)}%`,
        },
        {
          title: 'Current Liquidity Available',
          value: formatHugeNumbersToShortHuman(tvlState.totalValueLocked),
        },
        {
          title: t('system.protocol'),
          value: <ProductCardProtocolLink ilk={cardData.symbol} />,
        },
      ]}
      button={{
        link: `/earn/open/${cardData.symbol}`,
        text: t('nav.earn'),
      }}
      background={cardData.background}
      isFull={false}
    />
  )
}
