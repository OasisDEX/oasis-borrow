import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  MorphoContentFooterBorrow,
  MorphoContentFooterMultiply,
} from 'features/omni-kit/protocols/morpho-blue/components/details-sections'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const MorphoDetailsSectionFooter: FC = () => {
  const {
    environment: { productType },
  } = useOmniGeneralContext()

  return productType === OmniProductType.Borrow ? (
    <MorphoContentFooterBorrow />
  ) : (
    <MorphoContentFooterMultiply />
  )
}
