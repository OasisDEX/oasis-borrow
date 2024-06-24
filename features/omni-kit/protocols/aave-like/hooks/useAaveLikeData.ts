import { networksById } from 'blockchain/networks'
import { useProductContext } from 'components/context/ProductContextProvider'
import { useAaveContext } from 'features/aave'
import { getAaveHistoryEvents } from 'features/aave/services'
import { mapAaveLikeRaysMultipliers } from 'features/omni-kit/protocols/aave-like/helpers/mapAaveLikeRaysMultipliers'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { getRaysUserMultipliers } from 'features/rays/getRaysUserMultipliers'
import { useObservable } from 'helpers/observableHook'
import { isAaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'
import { useMemo } from 'react'
import { EMPTY, from } from 'rxjs'

export function useAaveLikeData({
  dpmPositionData,
  networkId,
  protocol,
  collateralToken,
  quoteToken,
  isOpening,
  walletAddress,
}: OmniProtocolHookProps) {
  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const { aaveLikePosition$ } = useProductContext()

  const networkName = networksById[networkId].name

  const { getAaveLikeAssetsPrices$, chainLinkETHUSDOraclePrice$ } = useAaveContext(
    protocol,
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
              getAaveHistoryEvents(
                dpmPositionData.proxy,
                networkId,
                collateralToken,
                quoteToken,
                protocol,
              ),
            )
          : EMPTY,
      [dpmPositionData, aavePositionData, networkId],
    ),
  )

  const [multipliers] = useObservable(
    useMemo(
      () =>
        dpmPositionData
          ? from(
              getRaysUserMultipliers({
                walletAddress: isOpening && walletAddress ? walletAddress : dpmPositionData.user,
              }),
            )
          : EMPTY,
      [dpmPositionData],
    ),
  )

  const positionRaysMultipliersData = mapAaveLikeRaysMultipliers({
    multipliers,
    collateralTokenAddress: dpmPositionData?.collateralTokenAddress,
    quoteTokenAddress: dpmPositionData?.collateralTokenAddress,
    dpmProxy: dpmPositionData?.proxy,
    protocol,
    networkName,
  })

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
      positionRaysMultipliersData,
    },
    errors: [
      aavePositionError,
      aavePositionAggregatedError,
      aaveLikeAssetsPricesError,
      chainLinkEthUsdcPriceError,
    ],
  }
}
