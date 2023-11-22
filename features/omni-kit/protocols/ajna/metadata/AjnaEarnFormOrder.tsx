import { useOmniProductContext } from 'features/omni-kit/contexts'
import {
  AjnaClaimCollateralFormOrderInformation,
  AjnaEarnFormOrderInformation,
} from 'features/omni-kit/protocols/ajna/metadata'
import {
  OmniEarnFormAction,
  type OmniIsCachedPosition,
  OmniProductType,
} from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const AjnaEarnFormOrder: FC<OmniIsCachedPosition> = ({ cached = false }) => {
  const {
    form: {
      state: { action },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return action === OmniEarnFormAction.ClaimEarn ? (
    <AjnaClaimCollateralFormOrderInformation cached={cached} />
  ) : (
    <AjnaEarnFormOrderInformation cached={cached} />
  )
}
