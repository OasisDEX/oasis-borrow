import { networksById } from 'blockchain/networks'
import { useProductContext } from 'components/context/ProductContextProvider'
import { mapMorphoBlueRaysMultipliers } from 'features/omni-kit/protocols/morpho-blue/helpers/mapMorphoBlueRaysMultipliers'
import { useMorphoOraclePrices } from 'features/omni-kit/protocols/morpho-blue/hooks'
import { getMorphoPositionAggregatedData$ } from 'features/omni-kit/protocols/morpho-blue/observables'
import type { OmniProtocolHookProps } from 'features/omni-kit/types'
import { getRaysUserMultipliers } from 'features/rays/getRaysUserMultipliers'
import { useObservable } from 'helpers/observableHook'
import { useMemo } from 'react'
import { EMPTY, from } from 'rxjs'

export function useMorphoData({
  dpmPositionData,
  networkId,
  protocol,
  pairId,
  tokenPriceUSDData,
  tokensPrecision,
  isOpening,
  walletAddress,
}: OmniProtocolHookProps) {
  const { morphoPosition$ } = useProductContext()
  const networkName = networksById[networkId].name

  const oraclePrices = useMorphoOraclePrices({
    networkId,
    pairId,
    collateralPrecision: tokensPrecision?.collateralPrecision,
    collateralToken: dpmPositionData?.collateralToken,
    quotePrecision: tokensPrecision?.quotePrecision,
    quoteToken: dpmPositionData?.quoteToken,
    tokenPriceUSDData,
  })

  const [morphoPositionData, morphoPositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData &&
        oraclePrices &&
        oraclePrices[dpmPositionData.collateralToken] &&
        oraclePrices[dpmPositionData.quoteToken]
          ? morphoPosition$(
              oraclePrices[dpmPositionData.collateralToken],
              oraclePrices[dpmPositionData.quoteToken],
              dpmPositionData,
              pairId,
              networkId,
              tokensPrecision,
            )
          : EMPTY,
      [dpmPositionData, oraclePrices],
    ),
  )

  const [morphoPositionAggregatedData, morphoPositionAggregatedError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && morphoPositionData
          ? getMorphoPositionAggregatedData$({
              dpmPositionData,
              networkId,
              poolId: morphoPositionData.marketParams.id,
            })
          : EMPTY,
      [dpmPositionData, morphoPositionData, networkId],
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

  const positionRaysMultipliersData = mapMorphoBlueRaysMultipliers({
    multipliers,
    dpmPositionData,
    protocol,
    networkName,
    networkId,
    pairId,
  })

  return {
    data: {
      aggregatedData: morphoPositionAggregatedData,
      poolId: morphoPositionData?.marketParams.id,
      positionData: morphoPositionData,
      protocolPricesData: oraclePrices,
      positionRaysMultipliersData,
    },
    errors: [morphoPositionError, morphoPositionAggregatedError],
  }
}
