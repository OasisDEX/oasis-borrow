import { NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { DpmPositionData } from 'features/omni-kit/observables'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import { useAjnaRedirect } from 'features/omni-kit/protocols/ajna/hooks'
import { getAjnaPositionAggregatedData$ } from 'features/omni-kit/protocols/ajna/observables'
import type { OmniProductType } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { one } from 'helpers/zero'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

// TODO this interface won't be protocol specific and could be easily extended with the rest of protocol data
export interface ProductDataProps {
  collateralToken?: string
  dpmPositionData?: DpmPositionData
  positionId?: string
  productType?: OmniProductType
  quoteToken?: string
  tokenPriceUSDData?: Tickers
}

export function useAjnaData({
  collateralToken,
  dpmPositionData,
  positionId,
  productType,
  quoteToken,
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
    positionId,
    productType,
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
