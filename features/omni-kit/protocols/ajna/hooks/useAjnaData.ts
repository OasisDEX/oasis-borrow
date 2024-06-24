import { networksById } from 'blockchain/networks'
import { useProductContext } from 'components/context/ProductContextProvider'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import { mapAjnaRaysMultipliers } from 'features/omni-kit/protocols/ajna/helpers/mapAjnaRaysMultipliers'
import { useAjnaRedirect } from 'features/omni-kit/protocols/ajna/hooks'
import { getAjnaPositionAggregatedData$ } from 'features/omni-kit/protocols/ajna/observables'
import type { OmniProductType, OmniProtocolHookProps } from 'features/omni-kit/types'
import { getRaysUserMultipliers } from 'features/rays/getRaysUserMultipliers'
import { useObservable } from 'helpers/observableHook'
import { one } from 'helpers/zero'
import { useMemo } from 'react'
import { EMPTY, from } from 'rxjs'

export function useAjnaData({
  collateralToken,
  dpmPositionData,
  networkId,
  quoteToken,
  tokenPriceUSDData,
  isOpening,
  walletAddress,
  protocol,
}: OmniProtocolHookProps) {
  const { ajnaPosition$ } = useProductContext()

  const networkName = networksById[networkId].name

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

  const poolId = ajnaPositionData?.pool.poolAddress

  const positionRaysMultipliersData = mapAjnaRaysMultipliers({
    multipliers,
    dpmProxy: dpmPositionData?.proxy,
    protocol,
    networkName,
    poolId,
  })

  return {
    data: {
      aggregatedData: ajnaPositionAggregatedData,
      poolId: ajnaPositionData?.pool.poolAddress,
      positionData: ajnaPositionData,
      protocolPricesData: tokenPriceUSDData,
      positionRaysMultipliersData,
    },
    errors: [ajnaPositionAggregatedError, ajnaPositionError],
  }
}
