import { networksById } from 'blockchain/networks'
import { useProductContext } from 'components/context/ProductContextProvider'
import { useAaveContext } from 'features/aave'
import { getAaveHistoryEvents } from 'features/aave/services'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import { getTriggersRequest } from 'helpers/lambda/triggers'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import { makeObservable } from 'lendingProtocols/pipelines'
import { useMemo } from 'react'
import { EMPTY, from } from 'rxjs'

export function useAaveLikeData({
  dpmPositionData,
  networkId,
  protocol,
  collateralToken,
  quoteToken,
}: OmniProtocolHookProps) {
  const { aaveLikePosition$, onEveryBlock$ } = useProductContext()

  const networkName = networksById[networkId].name

  const { getAaveLikeAssetsPrices$, chainLinkETHUSDOraclePrice$ } = useAaveContext(
    protocol as AaveLikeLendingProtocol,
    networkName,
  )

  const [chainLinkEthUsdcPriceData, chainLinkEthUsdcPriceError] = useObservable(
    chainLinkETHUSDOraclePrice$,
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

  const isAaveV2 = protocol === LendingProtocol.AaveV2

  const resolvedCollateralPrice = useMemo(
    () =>
      aaveLikeAssetsPricesData && chainLinkEthUsdcPriceData
        ? isAaveV2
          ? aaveLikeAssetsPricesData[0].times(chainLinkEthUsdcPriceData)
          : aaveLikeAssetsPricesData[0]
        : undefined,
    [aaveLikeAssetsPricesData, chainLinkEthUsdcPriceData],
  )

  const resolvedQuotePrice = useMemo(
    () =>
      aaveLikeAssetsPricesData && chainLinkEthUsdcPriceData
        ? isAaveV2
          ? aaveLikeAssetsPricesData[1].times(chainLinkEthUsdcPriceData)
          : aaveLikeAssetsPricesData[1]
        : undefined,
    [aaveLikeAssetsPricesData, chainLinkEthUsdcPriceData],
  )

  const [aavePositionData, aavePositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && resolvedCollateralPrice && resolvedQuotePrice
          ? aaveLikePosition$(
              resolvedCollateralPrice,
              resolvedQuotePrice,
              dpmPositionData,
              networkId,
            )
          : EMPTY,
      [dpmPositionData, resolvedCollateralPrice, resolvedQuotePrice],
    ),
  )

  const [aavePositionAggregatedData, aavePositionAggregatedError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && aavePositionData
          ? from(
              getAaveHistoryEvents(dpmPositionData.proxy, networkId, collateralToken, quoteToken),
            )
          : EMPTY,
      [dpmPositionData, aavePositionData, networkId],
    ),
  )
  const getTriggersRequest$ = makeObservable(onEveryBlock$, getTriggersRequest)

  const [positionTriggersData] = useObservable(
    useMemo(
      () => (dpmPositionData ? getTriggersRequest$({ dpm: dpmPositionData, networkId }) : EMPTY),
      [dpmPositionData, networkId],
    ),
  )
  const historyEvents = aavePositionAggregatedData?.events
  const recentHistoryEvent = historyEvents?.[0]

  return {
    data: {
      aggregatedData: {
        history: historyEvents || [],
        auction: recentHistoryEvent?.kind === 'Liquidation' ? recentHistoryEvent : undefined,
      },
      positionData: aavePositionData,
      protocolPricesData:
        resolvedCollateralPrice && resolvedQuotePrice
          ? {
              [collateralToken]: resolvedCollateralPrice,
              [quoteToken]: resolvedQuotePrice,
            }
          : undefined,
      positionTriggersData,
    },
    errors: [
      aavePositionError,
      aavePositionAggregatedError,
      aaveLikeAssetsPricesError,
      chainLinkEthUsdcPriceError,
    ],
  }
}
