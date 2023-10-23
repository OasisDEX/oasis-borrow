import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { AjnaOmniEarnFormOrder } from 'features/omni-kit/metadata/ajna/AjnaOmniEarnFormOrder'
import { AjnaOmniEarnSlider } from 'features/omni-kit/metadata/ajna/AjnaOmniEarnSlider'
import type { FC } from 'react'
import React from 'react'

interface AjnaOmniEarnFormContentAdjustProps {
  isFormValid: boolean
  isFormFrozen: boolean
}

export const AjnaOmniEarnFormContentAdjust: FC<AjnaOmniEarnFormContentAdjustProps> = ({
  isFormValid,
  isFormFrozen,
}) => {
  const {
    environment: { isOracless },
  } = useOmniGeneralContext()
  const { position } = useOmniProductContext('earn')

  const pool = (position.currentPosition.position as AjnaEarnPosition).pool

  return (
    <>
      <AjnaOmniEarnSlider
        nestedManualInput={!(isOracless && pool.lowestUtilizedPriceIndex.isZero())}
        isFormFrozen={isFormFrozen}
      />
      {isFormValid && (
        <OmniFormContentSummary>
          <AjnaOmniEarnFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
