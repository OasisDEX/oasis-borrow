import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { AjnaOmniClaimCollateralFormOrderInformation } from 'features/omni-kit/metadata/ajna/AjnaOmniClaimCollateralFormOrderInformation'
import { AjnaOmniEarnFormOrderInformation } from 'features/omni-kit/metadata/ajna/AjnaOmniEarnFormOrderInformation'
import type { OmniIsCachedPosition } from 'features/omni-kit/types/common.types'
import type { FC } from 'react'
import React from 'react'

export const AjnaOmniEarnFormOrder: FC<OmniIsCachedPosition> = ({ cached = false }) => {
  const {
    form: {
      state: { action },
    },
  } = useOmniProductContext('earn')

  return action === 'claim-earn' ? (
    <AjnaOmniClaimCollateralFormOrderInformation cached={cached} />
  ) : (
    <AjnaOmniEarnFormOrderInformation cached={cached} />
  )
}
