import { NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { useAjnaRedirect } from 'features/ajna/positions/common/hooks/useAjnaRedirect'
import { getAjnaPositionAggregatedData$ } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import type { OmniProduct } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { one } from 'helpers/zero'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

// TODO this interface won't be protocol specific and could be easily extended with the rest of protocol data
export interface ProductDataProps {
  collateralToken?: string
  id?: string
  product?: OmniProduct
  quoteToken?: string
  dpmPositionData?: DpmPositionData
  tokenPriceUSDData?: Tickers
}

export function useAjnaOmniData({
  collateralToken,
  id,
  product,
  quoteToken,
  dpmPositionData,
  tokenPriceUSDData,
}: ProductDataProps) {
  const { context$ } = useMainContext()
  const { ajnaPosition$ } = useProductContext()

  const isOracless = !!(
    collateralToken &&
    quoteToken &&
    isPoolOracless({ collateralToken, quoteToken })
  )

  const [context] = useObservable(context$)

  const [ajnaPositionData, ajnaPositionError] = useObservable(
    useMemo(
      () =>
        !isOracless && dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(
              tokenPriceUSDData[dpmPositionData.collateralToken],
              tokenPriceUSDData[dpmPositionData.quoteToken],
              dpmPositionData,
              dpmPositionData.collateralTokenAddress,
              dpmPositionData.quoteTokenAddress,
            )
          : isOracless && dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(one, one, dpmPositionData, collateralToken, quoteToken)
          : EMPTY,
      [dpmPositionData, isOracless, tokenPriceUSDData],
    ),
  )

  const [ajnaPositionAggregatedData, ajnaPositionAggregatedError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && ajnaPositionData
          ? getAjnaPositionAggregatedData$({
              dpmPositionData,
              position: ajnaPositionData,
              networkId: context?.chainId ?? NetworkIds.MAINNET,
            })
          : EMPTY,
      [dpmPositionData, ajnaPositionData, context?.chainId],
    ),
  )

  const redirect = useAjnaRedirect({
    ajnaPositionData,
    collateralToken,
    dpmPositionData,
    id,
    product,
    quoteToken,
  })

  return {
    data: {
      aggregatedData: ajnaPositionAggregatedData,
      positionData: ajnaPositionData,
    },
    errors: [ajnaPositionAggregatedError, ajnaPositionError],
    isOracless,
    redirect,
  }
}
