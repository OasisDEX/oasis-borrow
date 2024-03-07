import { useProductContext } from 'components/context/ProductContextProvider'
import { omniPositionTriggersDataDefault } from 'features/omni-kit/constants'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import { useAjnaRedirect } from 'features/omni-kit/protocols/ajna/hooks'
import { getAjnaPositionAggregatedData$ } from 'features/omni-kit/protocols/ajna/observables'
import type { OmniProductType, OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { one } from 'helpers/zero'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

export function useAjnaData({
  collateralToken,
  dpmPositionData,
  networkId,
  quoteToken,
  tokenPriceUSDData,
}: OmniProtocolHookProps) {
  const { ajnaPosition$ } = useProductContext()

  const isOracless = !!(
    collateralToken &&
    quoteToken &&
    isPoolOracless({ collateralToken, quoteToken, networkId })
  )

  void useAjnaRedirect({
    collateralToken,
    isOracless,
    networkId,
    productType: dpmPositionData?.product as OmniProductType,
    quoteToken,
  })

  const [ajnaPositionData, ajnaPositionError] = useObservable(
    useMemo(
      () =>
        !isOracless && dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(
              tokenPriceUSDData[dpmPositionData.collateralToken],
              tokenPriceUSDData[dpmPositionData.quoteToken],
              dpmPositionData,
              networkId,
              dpmPositionData.collateralTokenAddress,
              dpmPositionData.quoteTokenAddress,
            )
          : isOracless && dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(one, one, dpmPositionData, networkId, collateralToken, quoteToken)
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
              networkId,
            })
          : EMPTY,
      [dpmPositionData, ajnaPositionData, networkId],
    ),
  )

  return {
    data: {
      aggregatedData: ajnaPositionAggregatedData,
      positionData: ajnaPositionData,
      protocolPricesData: tokenPriceUSDData,
      positionTriggersData: omniPositionTriggersDataDefault,
    },
    errors: [ajnaPositionAggregatedError, ajnaPositionError],
  }
}
