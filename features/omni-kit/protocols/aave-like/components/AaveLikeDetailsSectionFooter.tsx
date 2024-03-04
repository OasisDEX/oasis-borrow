import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  AaveLikeContentFooterBorrow,
  AaveLikeContentFooterMultiply,
} from 'features/omni-kit/protocols/aave-like/components'
import { AaveLikeContentFooterYieldLoop } from 'features/omni-kit/protocols/aave-like/components/AaveLikeContentFooterYieldLoop'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const AaveLikeDetailsSectionFooter: FC = () => {
  const {
    environment: { productType, isYieldLoopWithData, isOpening },
  } = useOmniGeneralContext()

  return productType === OmniProductType.Borrow ? (
    <AaveLikeContentFooterBorrow />
  ) : isYieldLoopWithData && isOpening ? (
    <AaveLikeContentFooterYieldLoop />
  ) : (
    <AaveLikeContentFooterMultiply />
  )
}
