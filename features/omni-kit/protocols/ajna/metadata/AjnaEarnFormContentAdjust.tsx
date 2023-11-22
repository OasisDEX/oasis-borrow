import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { OmniFormContentSummary } from 'features/omni-kit/components/sidebars/OmniFormContentSummary'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { AjnaEarnFormOrder, AjnaEarnSlider } from 'features/omni-kit/protocols/ajna/metadata'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

interface AjnaEarnFormContentAdjustProps {
  isFormValid: boolean
  isFormFrozen: boolean
}

export const AjnaEarnFormContentAdjust: FC<AjnaEarnFormContentAdjustProps> = ({
  isFormValid,
  isFormFrozen,
}) => {
  const {
    environment: { isOracless },
  } = useOmniGeneralContext()
  const { position } = useOmniProductContext(OmniProductType.Earn)

  const pool = (position.currentPosition.position as AjnaEarnPosition).pool

  return (
    <>
      <AjnaEarnSlider
        nestedManualInput={!(isOracless && pool.lowestUtilizedPriceIndex.isZero())}
        isFormFrozen={isFormFrozen}
      />
      {isFormValid && (
        <OmniFormContentSummary>
          <AjnaEarnFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
