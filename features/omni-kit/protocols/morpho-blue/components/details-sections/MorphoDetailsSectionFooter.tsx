import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  MorphoContentFooterBorrow,
  MorphoContentFooterMultiply,
} from 'features/omni-kit/protocols/morpho-blue/components/details-sections'
import { MorphoContentFooterYieldLoop } from 'features/omni-kit/protocols/morpho-blue/components/details-sections/MorphoContentFooterYieldLoop'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const MorphoDetailsSectionFooter: FC = () => {
  const {
    environment: { productType, isYieldLoopWithData },
  } = useOmniGeneralContext()

  if (productType === OmniProductType.Multiply && isYieldLoopWithData) {
    return <MorphoContentFooterYieldLoop />
  }

  return productType === OmniProductType.Borrow ? (
    <MorphoContentFooterBorrow />
  ) : (
    <MorphoContentFooterMultiply />
  )
}
