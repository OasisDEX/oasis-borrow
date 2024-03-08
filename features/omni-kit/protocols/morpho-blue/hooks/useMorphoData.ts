import { useProductContext } from 'components/context/ProductContextProvider'
import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'
import { getMorphoPositionAggregatedData$ } from 'features/omni-kit/protocols/morpho-blue/observables'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

export function useMorphoData({
  dpmPositionData,
  networkId,
  tokenPriceUSDData,
  tokensPrecision,
}: OmniProtocolHookProps) {
  const { morphoPosition$ } = useProductContext()

  const [morphoPositionData, morphoPositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && tokenPriceUSDData
          ? morphoPosition$(
              tokenPriceUSDData[dpmPositionData.collateralToken],
              tokenPriceUSDData[dpmPositionData.quoteToken],
              dpmPositionData,
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
