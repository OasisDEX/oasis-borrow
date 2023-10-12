import { NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { isShortPosition } from 'features/ajna/positions/common/helpers/isShortPosition'
import type { AjnaPositionAggregatedDataResponse } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { getAjnaPositionAggregatedData$ } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { useObservable } from 'helpers/observableHook'
import { one } from 'helpers/zero'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

interface OmniKitAjnaDataProps {
  dpmPositionData?: DpmPositionData
  isOracless?: boolean
  tokenPriceUSDData?: Tickers
}

interface OmniKitMasterDataResponse {
  data: {
    ajnaPositionAggregatedData?: AjnaPositionAggregatedDataResponse
    ajnaPositionData?: AjnaGenericPosition
    isAjnaOracless?: boolean
    isAjnaShort?: boolean
  }
  errors: any[]
}

export function useOmniKitAjnaData({
  dpmPositionData,
  isOracless,
  tokenPriceUSDData,
}: OmniKitAjnaDataProps): OmniKitMasterDataResponse {
  const { context$ } = useMainContext()
  const { ajnaPosition$ } = useProductContext()

  const [context] = useObservable(context$)

  const isAjnaOracless = useMemo(() => {
    return dpmPositionData
      ? isOracless ||
          isPoolOracless({
            collateralToken: dpmPositionData.collateralToken,
            quoteToken: dpmPositionData.quoteToken,
          })
      : undefined
  }, [dpmPositionData, isOracless])

  const isAjnaShort = useMemo(() => {
    return dpmPositionData
      ? isShortPosition({ collateralToken: dpmPositionData.collateralToken })
      : undefined
  }, [dpmPositionData])

  const [ajnaPositionData, ajnaPositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && tokenPriceUSDData && isAjnaOracless !== undefined
          ? ajnaPosition$(
              isAjnaOracless ? one : tokenPriceUSDData[dpmPositionData.collateralToken],
              isAjnaOracless ? one : tokenPriceUSDData[dpmPositionData.quoteToken],
              dpmPositionData,
              dpmPositionData.collateralTokenAddress,
              dpmPositionData.quoteTokenAddress,
            )
          : EMPTY,
      [dpmPositionData, isAjnaOracless, tokenPriceUSDData],
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

  return {
    data: {
      ajnaPositionAggregatedData,
      ajnaPositionData,
      isAjnaOracless,
      isAjnaShort,
    },
    errors: [ajnaPositionAggregatedError, ajnaPositionError],
  }
}
