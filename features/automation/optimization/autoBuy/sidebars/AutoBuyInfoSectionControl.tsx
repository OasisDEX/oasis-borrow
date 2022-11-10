import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { one } from 'helpers/zero'
import React from 'react'

import { AddAutoBuyInfoSection } from '../controls/AddAutoBuyInfoSection'

interface AutoBuyInfoSectionControlProps {
  executionPrice: BigNumber
  vault: Vault
  autoBuyState: AutoBSFormChange
  debtDelta: BigNumber
  collateralDelta: BigNumber
}

export function AutoBuyInfoSectionControl({
  executionPrice,
  vault,
  autoBuyState,
  debtDelta,
  collateralDelta,
}: AutoBuyInfoSectionControlProps) {
  const deviationPercent = autoBuyState.deviation.div(100)

  const targetRatioWithDeviationFloor = one
    .minus(deviationPercent)
    .times(autoBuyState.targetCollRatio)
  const targetRatioWithDeviationCeiling = one
    .plus(deviationPercent)
    .times(autoBuyState.targetCollRatio)

  return (
    <AddAutoBuyInfoSection
      token={vault.token}
      colRatioAfterBuy={autoBuyState.targetCollRatio}
      multipleAfterBuy={one.div(autoBuyState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={autoBuyState.execCollRatio}
      nextBuyPrice={executionPrice}
      collateralAfterNextBuy={{
        value: vault.lockedCollateral,
        secondaryValue: vault.lockedCollateral.plus(collateralDelta),
      }}
      outstandingDebtAfterNextBuy={{
        value: vault.debt,
        secondaryValue: vault.debt.plus(debtDelta),
      }}
      collateralToBePurchased={collateralDelta.abs()}
      targetRatioWithDeviationFloor={targetRatioWithDeviationFloor}
      targetRatioWithDeviationCeiling={targetRatioWithDeviationCeiling}
    />
  )
}
