import type { AjnaIsCachedPosition } from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaClaimCollateralFormOrderInformation } from 'features/ajna/positions/earn/controls/AjnaClaimCollateralFormOrderInformation'
import { AjnaEarnFormOrderInformation } from 'features/ajna/positions/earn/controls/AjnaEarnFormOrderInformation'
import type { FC } from 'react'
import React from 'react'

export const AjnaEarnFormOrder: FC<AjnaIsCachedPosition> = ({ cached = false }) => {
  const {
    form: {
      state: { action },
    },
  } = useAjnaProductContext('earn')

  return action === 'claim-earn' ? (
    <AjnaClaimCollateralFormOrderInformation cached={cached} />
  ) : (
    <AjnaEarnFormOrderInformation cached={cached} />
  )
}
