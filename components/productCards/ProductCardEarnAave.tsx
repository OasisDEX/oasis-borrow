import BigNumber from 'bignumber.js'
import { TokenMetadataType } from 'blockchain/tokensMetadata'
import { calculateSimulation } from 'features/earn/aave/open/services'
import { useEarnContext } from 'features/earn/EarnContextProvider'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatHugeNumbersToShortHuman, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

import { ProductCard, ProductCardProtocolLink } from './ProductCard'
import { ProductCardsLoader } from './ProductCardsWrapper'

type ProductCardEarnAaveProps = {
  cardData: TokenMetadataType
}

const aaveCalcValueBasis = {
  amount: new BigNumber(100),
  token: 'ETH',
}

export function ProductCardEarnAave({ cardData }: ProductCardEarnAaveProps) {
  const { t } = useTranslation()
  const {
    aaveReserveConfigurationData,
    aaveSthEthYieldsQuery,
    aaveAvailableLiquidityETH$,
  } = useEarnContext()
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveReserveConfigurationData)
  const [aaveAvailableLiquidityETH, aaveAvailableLiquidityETHError] = useObservable(
    aaveAvailableLiquidityETH$,
  )

  const [simulations, setSimulations] = useState<ReturnType<typeof calculateSimulation>>()
  const maximumMultiple = aaveReserveState ? one.div(one.minus(aaveReserveState!.ltv)) : undefined

  useEffect(() => {
    if (maximumMultiple) {
      void (async () => {
        setSimulations(
          calculateSimulation({
            ...aaveCalcValueBasis,
            yields: await aaveSthEthYieldsQuery(maximumMultiple),
            multiply: maximumMultiple,
          }),
        )
      })()
    }
  }, [maximumMultiple])

  return (
    <WithErrorHandler error={[aaveReserveStateError, aaveAvailableLiquidityETHError]}>
      <WithLoadingIndicator
        value={[aaveReserveState, aaveAvailableLiquidityETH, maximumMultiple]}
        customLoader={<ProductCardsLoader />}
      >
        {([_aaveReserveState, _availableLiquidity, _maximumMultiple]) => (
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
                value: _maximumMultiple.times(aaveCalcValueBasis.amount).toFormat(0),
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
                value: formatHugeNumbersToShortHuman(_availableLiquidity),
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
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
