import { useOmniProductContext } from 'features/omni-kit/contexts'
import {
  AjnaOmniClaimCollateralFormOrderInformation,
  AjnaOmniEarnFormOrderInformation,
} from 'features/omni-kit/protocols/ajna/metadata'
import {
  OmniEarnFormAction,
  type OmniIsCachedPosition,
  OmniProductType,
} from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const AjnaOmniEarnFormOrder: FC<OmniIsCachedPosition> = ({ cached = false }) => {
  const {
    form: {
      state: { action },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return action === OmniEarnFormAction.ClaimEarn ? (
    <AjnaOmniClaimCollateralFormOrderInformation cached={cached} />
  ) : (
    <AjnaOmniEarnFormOrderInformation cached={cached} />
  )
}
