import { OmniKitProductController } from 'features/omni-kit/controls/OmniKitProductController'
import type { OmniKitMasterDataResponse } from 'features/omni-kit/hooks/useOmniKitMasterData'
import { useOmniKitAjnaData } from 'features/omni-kit/protocols/useOmniKitAjnaData'
import type { OmniKitProductPageProps } from 'features/omni-kit/types'
import React from 'react'

interface OmniKitAjnaWrapperProps extends OmniKitProductPageProps {
  masterData: OmniKitMasterDataResponse
}

export function OmniKitAjnaController({ masterData, ...rest }: OmniKitAjnaWrapperProps) {
  const {
    data: { dpmPositionData, tokenPriceUSDData },
    isOracless,
  } = masterData
  const { data, errors } = useOmniKitAjnaData({
    dpmPositionData,
    isOracless,
    tokenPriceUSDData,
  })
  const { isAjnaOracless, isAjnaShort } = data

  const isLoaded = [...Object.values(masterData.data), ...Object.values(data)].some(
    (item) => item === undefined,
  )
    ? undefined
    : true

  return (
    <OmniKitProductController
      isOracless={isAjnaOracless}
      isShort={isAjnaShort}
      errors={[...masterData.errors, ...errors]}
      isLoaded={isLoaded}
      masterData={masterData.data}
      {...rest}
    />
  )
}
