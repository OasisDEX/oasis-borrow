import { useOmniProductContext } from 'features/omni-kit/contexts'
import {
  AjnaClaimCollateralFormOrderInformation,
  AjnaEarnFormOrderInformation,
} from 'features/omni-kit/protocols/ajna/metadata'
import { OmniEarnFormAction, OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

export const AjnaEarnFormOrder: FC = () => {
  const {
    form: {
      state: { action },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return action === OmniEarnFormAction.ClaimEarn ? (
    <AjnaClaimCollateralFormOrderInformation />
  ) : (
    <AjnaEarnFormOrderInformation />
  )
}
