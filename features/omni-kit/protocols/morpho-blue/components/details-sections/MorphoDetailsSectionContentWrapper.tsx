import { OmniOpenYieldLoopDetails } from 'features/omni-kit/components/details-section/OmniOpenYieldLoopDetails'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { MorphoDetailsSectionContent } from 'features/omni-kit/protocols/morpho-blue/components/details-sections/MorphoDetailsSectionContent'
import type { FC } from 'react'
import React from 'react'

export const MorphoDetailsSectionContentWrapper: FC = () => {
  const {
    environment: { isYieldLoopWithData, isOpening },
  } = useOmniGeneralContext()

  return isYieldLoopWithData && isOpening ? (
    <OmniOpenYieldLoopDetails />
  ) : (
    <MorphoDetailsSectionContent />
  )
}
