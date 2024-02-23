import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  AaveLikeContentFooterBorrow,
  AaveLikeContentFooterMultiply,
} from 'features/omni-kit/protocols/aave-like/components'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const AaveLikeDetailsSectionFooter: FC = () => {
  const {
    environment: { productType },
  } = useOmniGeneralContext()

  return productType === OmniProductType.Borrow ? (
    <AaveLikeContentFooterBorrow />
  ) : (
    <AaveLikeContentFooterMultiply />
  )
}
