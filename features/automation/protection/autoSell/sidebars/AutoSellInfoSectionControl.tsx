import type BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import { AddAutoSellInfoSection } from 'features/automation/protection/autoSell/controls/AddAutoSellInfoSection'
import { one } from 'helpers/zero'
import React from 'react'

interface AutoSellInfoSectionControlProps {
  autoSellState: AutoBSFormChange
  debtDelta: BigNumber
  collateralDelta: BigNumber
  executionPrice: BigNumber
  maxGasFee?: number
}

export function AutoSellInfoSectionControl({
  autoSellState,
  debtDelta,
  collateralDelta,
  executionPrice,
  maxGasFee,
}: AutoSellInfoSectionControlProps) {
  const {
    positionData: { token, debt, lockedCollateral },
  } = useAutomationContext()

  const deviationPercent = autoSellState.deviation.div(100)
  const targetRatioWithDeviationFloor = one
    .minus(deviationPercent)
    .times(autoSellState.targetCollRatio)
  const targetRatioWithDeviationCeiling = one
    .plus(deviationPercent)
    .times(autoSellState.targetCollRatio)

  return (
    <AddAutoSellInfoSection
      targetCollRatio={autoSellState.targetCollRatio}
      multipleAfterSell={one.div(autoSellState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={autoSellState.execCollRatio}
      nextSellPrice={executionPrice}
      collateralAfterNextSell={{
        value: lockedCollateral,
        change: lockedCollateral.plus(collateralDelta),
      }}
      outstandingDebtAfterSell={{
        value: debt,
        change: debt.plus(debtDelta),
      }}
      ethToBeSoldAtNextSell={collateralDelta.abs()}
      token={token}
      targetRatioWithDeviationCeiling={targetRatioWithDeviationCeiling}
      targetRatioWithDeviationFloor={targetRatioWithDeviationFloor}
      maxGasFee={maxGasFee}
    />
  )
}
