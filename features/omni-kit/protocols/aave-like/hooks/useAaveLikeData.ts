import { networksById } from 'blockchain/networks'
import { useProductContext } from 'components/context/ProductContextProvider'
import { useAaveContext } from 'features/aave'
import { getAaveHistoryEvents } from 'features/aave/services'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { useMemo } from 'react'
import { EMPTY, from } from 'rxjs'

export function useAaveLikeData({
  dpmPositionData,
  networkId,
  protocol,
  collateralToken,
  quoteToken,
}: OmniProtocolHookProps) {
  const { aaveLikePosition$ } = useProductContext()

  const networkName = networksById[networkId].name

  const { getAaveLikeAssetsPrices$ } = useAaveContext(
    protocol as AaveLikeLendingProtocol,
    networkName,
  )

  const [aaveLikeAssetsPricesData, aaveLikeAssetsPricesError] = useObservable(
    useMemo(
      () =>
        dpmPositionData
          ? getAaveLikeAssetsPrices$({
              tokens: [dpmPositionData.collateralToken, dpmPositionData.quoteToken],
            })
          : EMPTY,
      [dpmPositionData],
    ),
  )

  const [aavePositionData, aavePositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && aaveLikeAssetsPricesData
          ? aaveLikePosition$(
              aaveLikeAssetsPricesData[0],
              aaveLikeAssetsPricesData[1],
              dpmPositionData,
              networkId,
            )
          : EMPTY,
      [dpmPositionData, aaveLikeAssetsPricesData],
    ),
  )

  const [aavePositionAggregatedData, aavePositionAggregatedError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && aavePositionData
          ? from(getAaveHistoryEvents(dpmPositionData.proxy, networkId))
          : EMPTY,
      [dpmPositionData, aavePositionData, networkId],
    ),
  )

  return {
    data: {
      aggregatedData: {
        history: aavePositionAggregatedData?.events || [],
        auction: aavePositionAggregatedData?.events[0],
      },
      positionData: aavePositionData,
      protocolPricesData: aaveLikeAssetsPricesData
        ? {
            [collateralToken]: aaveLikeAssetsPricesData[0],
            [quoteToken]: aaveLikeAssetsPricesData[1],
          }
        : undefined,
    },
    errors: [aavePositionError, aavePositionAggregatedError, aaveLikeAssetsPricesError],
  }
}
