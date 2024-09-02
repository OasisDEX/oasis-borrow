import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  MakerContentFooterBorrow,
  MakerContentFooterMultiply,
} from 'features/omni-kit/protocols/maker/components/details-sections'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const MakerDetailsSectionFooter: FC = () => {
  const {
    environment: { productType },
  } = useOmniGeneralContext()

  return productType === OmniProductType.Borrow ? (
    <MakerContentFooterBorrow />
  ) : (
    <MakerContentFooterMultiply />
  )
}
