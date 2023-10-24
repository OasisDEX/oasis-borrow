import type { Tickers } from 'blockchain/prices.types'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import type { OmniProductType } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { one } from 'helpers/zero'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

// TODO this interface won't be protocol specific and could be easily extended with the rest of protocol data
export interface ProductDataProps {
  collateralToken?: string
  id?: string
  product?: OmniProductType
  quoteToken?: string
  dpmPositionData?: DpmPositionData
  tokenPriceUSDData?: Tickers
}

export function useMorphoOmniData({
  // collateralToken,
  // id,
  // product,
  // quoteToken,
  dpmPositionData,
  tokenPriceUSDData,
}: ProductDataProps) {
  // const { context$ } = useMainContext()
  const { morphoPosition$ } = useProductContext()

  // const [context] = useObservable(context$)
  const isOracless = false
  const [morphoPositionData, morphoPositionError] = useObservable(
    useMemo(
      () =>
        !isOracless && dpmPositionData && tokenPriceUSDData
          ? morphoPosition$(
              tokenPriceUSDData[dpmPositionData.collateralToken],
              tokenPriceUSDData[dpmPositionData.quoteToken],
              dpmPositionData,
            )
          : isOracless && dpmPositionData && tokenPriceUSDData
          ? morphoPosition$(one, one, dpmPositionData)
          : EMPTY,
      [dpmPositionData, isOracless, tokenPriceUSDData],
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
    isOracless,
    redirect: undefined,
  }
}
