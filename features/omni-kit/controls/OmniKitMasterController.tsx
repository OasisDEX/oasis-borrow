import type { OmniKitMasterDataResponse } from 'features/omni-kit/hooks/useOmniKitMasterData'
import { useOmniKitMasterData } from 'features/omni-kit/hooks/useOmniKitMasterData'
import type { OmniKitProductPageProps } from 'features/omni-kit/types'
import type { FC, ReactNode } from 'react'

interface OmniKitMasterControllerProps extends OmniKitProductPageProps {
  children: (omniKitMasterData: OmniKitMasterDataResponse) => ReactNode
}

export const OmniKitMasterController: FC<OmniKitMasterControllerProps> = ({
  children,
  ...productPageProps
}) => {
  const omniKitMasterData = useOmniKitMasterData(productPageProps)

  return <>{children(omniKitMasterData)}</>
}
