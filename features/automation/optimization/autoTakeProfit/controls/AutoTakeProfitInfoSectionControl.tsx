import type BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { getOnCloseEstimations } from 'features/automation/common/estimations/onCloseEstimations'
import React from 'react'

import { AddAutoTakeProfitInfoSection } from './AddAutoTakeProfitInfoSection'

interface AutoTakeProfitInfoSectionControlProps {
  toCollateral: boolean
  triggerColPrice: BigNumber
  triggerColRatio: BigNumber
}

export function AutoTakeProfitInfoSectionControl({
  toCollateral,
  triggerColPrice,
  triggerColRatio,
}: AutoTakeProfitInfoSectionControlProps) {
  const {
    positionData: { token, debt, lockedCollateral, debtOffset },
    environmentData: { ethMarketPrice },
  } = useAutomationContext()

  const { estimatedGasFeeOnTrigger, estimatedOasisFeeOnTrigger, totalTriggerCost } =
    getOnCloseEstimations({
      colMarketPrice: triggerColPrice,
      colOraclePrice: triggerColPrice,
      debt: debt,
      debtOffset: debtOffset,
      ethMarketPrice,
      lockedCollateral: lockedCollateral,
      toCollateral: toCollateral,
    })

  return (
    <AddAutoTakeProfitInfoSection
      debtRepaid={debt}
      estimatedOasisFeeOnTrigger={estimatedOasisFeeOnTrigger}
      estimatedGasFeeOnTrigger={estimatedGasFeeOnTrigger}
      token={token}
      totalTriggerCost={totalTriggerCost}
      triggerColPrice={triggerColPrice}
      triggerColRatio={triggerColRatio}
    />
  )
}
