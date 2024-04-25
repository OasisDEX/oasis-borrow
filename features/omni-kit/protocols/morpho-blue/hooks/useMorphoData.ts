import type { Tickers } from 'blockchain/prices.types'
import { useProductContext } from 'components/context/ProductContextProvider'
import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'
import {
  getMorphoOracleAddress,
  getMorphoOraclePrice,
  getMorphoTokenPriceFromOraclePrice,
} from 'features/omni-kit/protocols/morpho-blue/helpers'
import { getMorphoPositionAggregatedData$ } from 'features/omni-kit/protocols/morpho-blue/observables'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { useEffect, useMemo, useState } from 'react'
import { EMPTY } from 'rxjs'

export function useMorphoData({
  dpmPositionData,
  networkId,
  pairId,
  tokenPriceUSDData,
  tokensPrecision,
}: OmniProtocolHookProps) {
  const { morphoPosition$ } = useProductContext()

  const [oraclePrices, setOraclePrices] = useState<Tickers | undefined>(tokenPriceUSDData)

  const marketId =
    morphoMarkets[networkId]?.[
      `${dpmPositionData?.collateralToken}-${dpmPositionData?.quoteToken}`
    ]?.[pairId - 1]

  useEffect(() => {
    if (
      dpmPositionData &&
      dpmPositionData.collateralToken &&
      dpmPositionData.quoteToken &&
      tokenPriceUSDData &&
      tokensPrecision &&
      marketId
    ) {
      if (
        !tokenPriceUSDData[dpmPositionData.collateralToken] ||
        !tokenPriceUSDData[dpmPositionData.quoteToken]
      )
        void getMorphoOracleAddress({ marketId, networkId })
          .then((oracleAddress) => {
            return getMorphoOraclePrice({
              collateralPrecision: tokensPrecision.collateralPrecision,
              networkId,
              oracleAddress,
              quotePrecision: tokensPrecision.quotePrecision,
            })
          })
          .then((price) => {
            setOraclePrices({
              ...tokenPriceUSDData,
              ...(tokenPriceUSDData[dpmPositionData.collateralToken] && {
                [dpmPositionData.quoteToken]: getMorphoTokenPriceFromOraclePrice({
                  marketPrice: price,
                  collateralPrice: tokenPriceUSDData[dpmPositionData.collateralToken],
                }),
              }),
              ...(tokenPriceUSDData[dpmPositionData.quoteToken] && {
                [dpmPositionData.collateralToken]: getMorphoTokenPriceFromOraclePrice({
                  marketPrice: price,
                  quotePrice: tokenPriceUSDData[dpmPositionData.quoteToken],
                }),
              }),
            })
          })
      else setOraclePrices(tokenPriceUSDData)
    } else setOraclePrices(tokenPriceUSDData)
  }, [dpmPositionData, marketId, tokenPriceUSDData])

  const [morphoPositionData, morphoPositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData &&
        oraclePrices &&
        oraclePrices[dpmPositionData.collateralToken] &&
        oraclePrices[dpmPositionData.quoteToken]
          ? morphoPosition$(
              oraclePrices[dpmPositionData.collateralToken],
              oraclePrices[dpmPositionData.quoteToken],
              dpmPositionData,
              pairId,
              networkId,
              tokensPrecision,
            )
          : EMPTY,
      [dpmPositionData, oraclePrices],
    ),
  )

  const [morphoPositionAggregatedData, morphoPositionAggregatedError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && morphoPositionData
          ? getMorphoPositionAggregatedData$({
              dpmPositionData,
              networkId,
            })
          : EMPTY,
      [dpmPositionData, morphoPositionData, networkId],
    ),
  )

  return {
    data: {
      aggregatedData: morphoPositionAggregatedData,
      positionData: morphoPositionData,
      protocolPricesData: oraclePrices,
      positionTriggersData: omniPositionTriggersDataDefault,
    },
    errors: [morphoPositionError, morphoPositionAggregatedError],
  }
}
