import { useProductContext } from 'components/context/ProductContextProvider'
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

  const morphoPositionAggregatedData = {
    auction: { test: '' },
    history: [],
  }

  return {
    data: {
      aggregatedData: morphoPositionAggregatedData,
      positionData: morphoPositionData,
    },
    errors: [morphoPositionError],
  }
}
