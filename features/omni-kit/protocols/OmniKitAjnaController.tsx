import { OmniKitProductController } from 'features/omni-kit/controls/OmniKitProductController'
import type { OmniKitMasterDataResponse } from 'features/omni-kit/hooks/useOmniKitMasterData'
import { useOmniKitAjnaData } from 'features/omni-kit/protocols/useOmniKitAjnaData'
import { useOmniKitAjnaHooksGenerator } from 'features/omni-kit/protocols/useOmniKitAjnaHooksGenerator'
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

  const { ajnaPositionData, isAjnaOracless, isAjnaShort } = data
  const hooks = useOmniKitAjnaHooksGenerator({ position: ajnaPositionData })

  const isLoaded = [...Object.values(masterData.data), ...Object.values(data), hooks].some(
    (item) => item === undefined,
  )
    ? undefined
    : true

  return (
    <OmniKitProductController
      errors={[...masterData.errors, ...errors]}
      hooks={hooks}
      isLoaded={isLoaded}
      isOracless={isAjnaOracless}
      isShort={isAjnaShort}
      masterData={masterData.data}
      {...rest}
    />
  )
}
