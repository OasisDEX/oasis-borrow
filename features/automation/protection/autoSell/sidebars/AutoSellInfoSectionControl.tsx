import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { one } from 'helpers/zero'
import React from 'react'

import { AddAutoSellInfoSection } from '../controls/AddAutoSellInfoSection'

interface AutoSellInfoSectionControlProps {
  vault: Vault
  autoSellState: AutoBSFormChange
  debtDelta: BigNumber
  collateralDelta: BigNumber
  executionPrice: BigNumber
  maxGasFee?: number
}

export function AutoSellInfoSectionControl({
  vault,
  autoSellState,
  debtDelta,
  collateralDelta,
  executionPrice,
  maxGasFee,
}: AutoSellInfoSectionControlProps) {
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
        value: vault.lockedCollateral,
        secondaryValue: vault.lockedCollateral.plus(collateralDelta),
      }}
      outstandingDebtAfterSell={{
        value: vault.debt,
        secondaryValue: vault.debt.plus(debtDelta),
      }}
      ethToBeSoldAtNextSell={collateralDelta.abs()}
      token={vault.token}
      targetRatioWithDeviationCeiling={targetRatioWithDeviationCeiling}
      targetRatioWithDeviationFloor={targetRatioWithDeviationFloor}
      maxGasFee={maxGasFee}
    />
  )
}
