import BigNumber from 'bignumber.js'
import { getOnCloseEstimations } from 'features/automation/common/estimations/onCloseEstimations'
import React from 'react'

import { AddAutoTakeProfitInfoSection } from './AddAutoTakeProfitInfoSection'

interface AutoTakeProfitInfoSectionControlProps {
  debt: BigNumber
  debtOffset: BigNumber
  ethMarketPrice: BigNumber
  lockedCollateral: BigNumber
  toCollateral: boolean
  token: string
  tokenMarketPrice: BigNumber
  triggerColPrice: BigNumber
  triggerColRatio: BigNumber
}

export function AutoTakeProfitInfoSectionControl({
  debt,
  debtOffset,
  ethMarketPrice,
  lockedCollateral,
  toCollateral,
  token,
  triggerColPrice,
  triggerColRatio,
}: AutoTakeProfitInfoSectionControlProps) {
  const {
    estimatedGasFeeOnTrigger,
    estimatedOasisFeeOnTrigger,
    totalTriggerCost,
  } = getOnCloseEstimations({
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
