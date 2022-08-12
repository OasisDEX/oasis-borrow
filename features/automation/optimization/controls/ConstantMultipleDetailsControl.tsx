import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { calculateMultipleFromTargetCollRatio } from 'features/automation/common/helpers'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { checkIfEditingConstantMultiple } from 'features/automation/optimization/common/helpers'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { calculatePNL } from 'helpers/multiply/calculations'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'
import { Grid } from 'theme-ui'

import { ConstantMultipleDetailsLayout } from './ConstantMultipleDetailsLayout'

interface ConstantMultipleDetailsControlProps {
  vault: Vault
  vaultHistory: VaultHistoryEvent[]
  tokenMarketPrice: BigNumber
  constantMultipleTriggerData: ConstantMultipleTriggerData
}

export function ConstantMultipleDetailsControl({
  vault,
  vaultHistory,
  tokenMarketPrice,
  constantMultipleTriggerData,
}: ConstantMultipleDetailsControlProps) {
  const { debt, lockedCollateral, token } = vault
  const netValueUSD = lockedCollateral.times(tokenMarketPrice).minus(debt)
  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )
  const isEditing = checkIfEditingConstantMultiple({
    triggerData: constantMultipleTriggerData,
    state: constantMultipleState,
  })
  const {
    isTriggerEnabled,
    targetCollRatio,
    buyExecutionCollRatio,
    sellExecutionCollRatio,
  } = constantMultipleTriggerData

  const constantMultipleDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      targetMultiple: calculateMultipleFromTargetCollRatio(targetCollRatio),
      targetColRatio: targetCollRatio,
      // TODO: PK calculate based on history entry
      totalCost: new BigNumber(3000),
      // TODO: PK vaultHistory should be cut down right after first found set up multiply event
      PnLSinceEnabled: calculatePNL(vaultHistory, netValueUSD),
      triggerColRatioToBuy: buyExecutionCollRatio,
      triggerColRatioToSell: sellExecutionCollRatio,
      nextBuyPrice: collateralPriceAtRatio({
        colRatio: buyExecutionCollRatio.div(100),
        collateral: lockedCollateral,
        vaultDebt: debt,
      }),
      nextSellPrice: collateralPriceAtRatio({
        colRatio: sellExecutionCollRatio.div(100),
        collateral: lockedCollateral,
        vaultDebt: debt,
      }),
    }),
    ...(isEditing && {
      afterTargetMultiple: constantMultipleState.multiplier,
      triggerColRatioToBuyToBuy: constantMultipleState.buyExecutionCollRatio,
      afterTriggerColRatioToSell: constantMultipleState.sellExecutionCollRatio,
    }),
  }

  return (
    <Grid>
      <ConstantMultipleDetailsLayout
        token={token}
        isTriggerEnabled={isTriggerEnabled}
        {...constantMultipleDetailsLayoutOptionalParams}
      />
    </Grid>
  )
}
