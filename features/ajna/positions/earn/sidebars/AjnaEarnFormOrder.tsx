import { AjnaIsCachedPosition } from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaClaimCollateralFormOrderInformation } from 'features/ajna/positions/earn/controls/AjnaClaimCollateralFormOrderInformation'
import { AjnaEarnFormOrderInformation } from 'features/ajna/positions/earn/controls/AjnaEarnFormOrderInformation'
import React, { FC } from 'react'

export const AjnaEarnFormOrder: FC<AjnaIsCachedPosition> = ({ cached = false }) => {
  const {
    position: {
      currentPosition: {
        position: { collateralTokenAmount },
      },
    },
  } = useAjnaProductContext('earn')

  return collateralTokenAmount.isZero() ? (
    <AjnaEarnFormOrderInformation cached={cached} />
  ) : (
    <AjnaClaimCollateralFormOrderInformation cached={cached} />
  )
}
