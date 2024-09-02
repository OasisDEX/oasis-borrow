import { useProductContext } from 'components/context/ProductContextProvider'
import { useMakerOraclePrices } from 'features/omni-kit/protocols/maker/hooks/useMakerOraclePrices'
import { getMakerPositionAggregatedData$ } from 'features/omni-kit/protocols/maker/observables'
import { makerMarkets } from 'features/omni-kit/protocols/maker/settings'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { getRaysUserMultipliers } from 'features/rays/getRaysUserMultipliers'
import { mapMakerRaysMultipliers } from 'handlers/portfolio/positions/handlers/maker/helpers/mapMakerRaysMultipliers'
import { useObservable } from 'helpers/observableHook'
import { useMemo } from 'react'
import { EMPTY, from } from 'rxjs'

export function useMakerData({
  dpmPositionData,
  networkId,
  pairId,
  tokenPriceUSDData,
  tokensPrecision,
  isOpening,
  walletAddress,
  collateralToken,
  quoteToken,
}: OmniProtocolHookProps) {
  const { makerPosition$ } = useProductContext()

  const oraclePrices = useMakerOraclePrices({
    networkId,
    pairId,
    collateralToken: dpmPositionData?.collateralToken,
    quoteToken: dpmPositionData?.quoteToken,
    tokenPriceUSDData,
  })

  const [makerPositionData, makerPositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && tokenPriceUSDData && oraclePrices
          ? makerPosition$(
              tokenPriceUSDData[collateralToken],
              oraclePrices.current[collateralToken],
              oraclePrices.next[collateralToken],
              tokenPriceUSDData[quoteToken],
              dpmPositionData,
              pairId,
              networkId,
              tokensPrecision,
            )
          : EMPTY,
      [dpmPositionData, tokenPriceUSDData, oraclePrices],
    ),
  )

  const poolId = makerMarkets[networkId]?.[`${collateralToken}-${quoteToken}`]?.[pairId - 1]

  const [makerPositionAggregatedData, makerPositionAggregatedError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && makerPositionData
          ? getMakerPositionAggregatedData$({
              dpmPositionData,
              networkId,
              poolId,
            })
          : EMPTY,
      [dpmPositionData, makerPositionData, networkId, pairId],
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

  const positionRaysMultipliersData = mapMakerRaysMultipliers({
    multipliers,
    dsProxy: dpmPositionData?.proxy,
    ilkId: '',
  })

  return {
    data: {
      aggregatedData: makerPositionAggregatedData,
      poolId,
      positionData: makerPositionData,
      protocolPricesData: oraclePrices?.current,
      positionRaysMultipliersData,
    },
    errors: [makerPositionError, makerPositionAggregatedError],
  }
}
