import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { AjnaOmniClaimCollateralFormOrderInformation } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniClaimCollateralFormOrderInformation'
import { AjnaOmniEarnFormOrderInformation } from 'features/omni-kit/protocols/ajna/metadata/AjnaOmniEarnFormOrderInformation'
import { type OmniIsCachedPosition, OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const AjnaOmniEarnFormOrder: FC<OmniIsCachedPosition> = ({ cached = false }) => {
  const {
    form: {
      state: { action },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return action === 'claim-earn' ? (
    <AjnaOmniClaimCollateralFormOrderInformation cached={cached} />
  ) : (
    <AjnaOmniEarnFormOrderInformation cached={cached} />
  )
}
