import { useProductContext } from 'components/context/ProductContextProvider'
import { useMorphoOraclePrices } from 'features/omni-kit/protocols/morpho-blue/hooks'
import { getMorphoPositionAggregatedData$ } from 'features/omni-kit/protocols/morpho-blue/observables'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

export function useMorphoData({
  dpmPositionData,
  networkId,
  pairId,
  tokenPriceUSDData,
  tokensPrecision,
}: OmniProtocolHookProps) {
  const { morphoPosition$ } = useProductContext()

  const oraclePrices = useMorphoOraclePrices({
    networkId,
    pairId,
    collateralPrecision: tokensPrecision?.collateralPrecision,
    collateralToken: dpmPositionData?.collateralToken,
    quotePrecision: tokensPrecision?.quotePrecision,
    quoteToken: dpmPositionData?.quoteToken,
    tokenPriceUSDData,
  })

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
      poolId: morphoPositionData?.marketParams.id,
      positionData: morphoPositionData,
      protocolPricesData: oraclePrices,
    },
    errors: [morphoPositionError, morphoPositionAggregatedError],
  }
}
