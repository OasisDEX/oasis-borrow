import type { Tickers } from 'blockchain/prices.types'
import { useProductContext } from 'components/context/ProductContextProvider'
import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'
import { getMorphoPositionAggregatedData$ } from 'features/omni-kit/protocols/morpho-blue/observables'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { one } from 'helpers/zero'
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

  const [oraclePrices, setOraclePrices] = useState<Tickers>()

  useEffect(() => {
    if (
      dpmPositionData &&
      dpmPositionData.collateralToken &&
      dpmPositionData.quoteToken &&
      tokenPriceUSDData
    ) {
      if (
        tokenPriceUSDData[dpmPositionData.collateralToken] &&
        tokenPriceUSDData[dpmPositionData.quoteToken]
      )
        setOraclePrices({
          [dpmPositionData.collateralToken]: tokenPriceUSDData[dpmPositionData.collateralToken],
          [dpmPositionData.quoteToken]: tokenPriceUSDData[dpmPositionData.quoteToken],
        })
      else {
        setOraclePrices({
          ...((tokenPriceUSDData[dpmPositionData.collateralToken]) && {
            [dpmPositionData.quoteToken]: one,
          }),
          ...(tokenPriceUSDData[dpmPositionData.quoteToken] && {
            [dpmPositionData.collateralToken]: one,
          }),
        })
      }
    }
  }, [dpmPositionData, tokenPriceUSDData])

  console.log('oraclePrices')
  console.log(oraclePrices)

  const [morphoPositionData, morphoPositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && tokenPriceUSDData
          ? morphoPosition$(
              tokenPriceUSDData[dpmPositionData.collateralToken],
              tokenPriceUSDData[dpmPositionData.quoteToken],
              dpmPositionData,
              pairId,
              networkId,
              tokensPrecision,
            )
          : EMPTY,
      [dpmPositionData, tokenPriceUSDData],
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
      protocolPricesData: tokenPriceUSDData,
      positionTriggersData: omniPositionTriggersDataDefault,
    },
    errors: [morphoPositionError, morphoPositionAggregatedError],
  }
}
