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
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import {
  calculatePNLFromAddConstantMultipleEvent,
  calculateTotalCostOfConstantMultiple,
} from 'helpers/multiply/calculations'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Grid } from 'theme-ui'

import { ConstantMultipleDetailsLayout } from './ConstantMultipleDetailsLayout'

interface ConstantMultipleDetailsControlProps {
  vault: Vault
  vaultType: VaultType
  vaultHistory: VaultHistoryEvent[]
  tokenMarketPrice: BigNumber
  constantMultipleTriggerData: ConstantMultipleTriggerData
}

export function ConstantMultipleDetailsControl({
  vault,
  vaultType,
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
    isRemoveForm: constantMultipleState.currentForm === 'remove',
  })
  const {
    isTriggerEnabled,
    targetCollRatio,
    buyExecutionCollRatio,
    sellExecutionCollRatio,
  } = constantMultipleTriggerData
  const constantMultipleReadOnlyEnabled = useFeatureToggle('ConstantMultipleReadOnly')

  const constantMultipleDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      targetMultiple: calculateMultipleFromTargetCollRatio(targetCollRatio),
      targetColRatio: targetCollRatio,
      totalCost: calculateTotalCostOfConstantMultiple(vaultHistory),
      PnLSinceEnabled: calculatePNLFromAddConstantMultipleEvent(vaultHistory, netValueUSD),
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

  if (constantMultipleReadOnlyEnabled) {
    return null
  }
  const isDebtZero = vault.debt.isZero()
  if (isDebtZero) {
    return null
  }

  return (
    <Grid>
      <ConstantMultipleDetailsLayout
        vaultType={vaultType}
        token={token}
        isTriggerEnabled={isTriggerEnabled}
        {...constantMultipleDetailsLayoutOptionalParams}
      />
    </Grid>
  )
}
