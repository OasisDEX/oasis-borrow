import type { IsCachedPosition } from 'features/ajna/common/types'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { AjnaClaimCollateralFormOrderInformation } from 'features/ajna/positions/earn/controls/AjnaClaimCollateralFormOrderInformation'
import { AjnaEarnFormOrderInformation } from 'features/ajna/positions/earn/controls/AjnaEarnFormOrderInformation'
import type { FC } from 'react'
import React from 'react'

export const AjnaEarnFormOrder: FC<IsCachedPosition> = ({ cached = false }) => {
  const {
    form: {
      state: { action },
    },
  } = useGenericProductContext('earn')

  return action === 'claim-earn' ? (
    <AjnaClaimCollateralFormOrderInformation cached={cached} />
  ) : (
    <AjnaEarnFormOrderInformation cached={cached} />
  )
}
