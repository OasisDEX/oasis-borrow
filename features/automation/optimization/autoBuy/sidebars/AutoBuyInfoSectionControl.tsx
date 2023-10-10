import type BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import { AddAutoBuyInfoSection } from 'features/automation/optimization/autoBuy/controls/AddAutoBuyInfoSection'
import { one } from 'helpers/zero'
import React from 'react'

interface AutoBuyInfoSectionControlProps {
  executionPrice: BigNumber
  autoBuyState: AutoBSFormChange
  debtDelta: BigNumber
  collateralDelta: BigNumber
}

export function AutoBuyInfoSectionControl({
  executionPrice,
  autoBuyState,
  debtDelta,
  collateralDelta,
}: AutoBuyInfoSectionControlProps) {
  const {
    positionData: { token, debt, lockedCollateral },
  } = useAutomationContext()

  const deviationPercent = autoBuyState.deviation.div(100)
  const targetRatioWithDeviationFloor = one
    .minus(deviationPercent)
    .times(autoBuyState.targetCollRatio)
  const targetRatioWithDeviationCeiling = one
    .plus(deviationPercent)
    .times(autoBuyState.targetCollRatio)

  return (
    <AddAutoBuyInfoSection
      token={token}
      colRatioAfterBuy={autoBuyState.targetCollRatio}
      multipleAfterBuy={one.div(autoBuyState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={autoBuyState.execCollRatio}
      nextBuyPrice={executionPrice}
      collateralAfterNextBuy={{
        value: lockedCollateral,
        change: lockedCollateral.plus(collateralDelta),
      }}
      outstandingDebtAfterNextBuy={{
        value: debt,
        change: debt.plus(debtDelta),
      }}
      collateralToBePurchased={collateralDelta.abs()}
      targetRatioWithDeviationFloor={targetRatioWithDeviationFloor}
      targetRatioWithDeviationCeiling={targetRatioWithDeviationCeiling}
    />
  )
}
