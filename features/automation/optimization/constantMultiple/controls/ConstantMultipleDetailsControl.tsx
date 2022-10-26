import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { calculateMultipleFromTargetCollRatio } from 'features/automation/common/helpers'
import { ConstantMultipleDetailsLayout } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleDetailsLayout'
import { checkIfIsEditingConstantMultiple } from 'features/automation/optimization/constantMultiple/helpers'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import {
  calculatePNLFromAddConstantMultipleEvent,
  calculateTotalCostOfConstantMultiple,
} from 'helpers/multiply/calculations'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

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
  const constantMultipleReadOnlyEnabled = useFeatureToggle('ConstantMultipleReadOnly')

  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )

  const { debt, lockedCollateral, token } = vault
  const {
    isTriggerEnabled,
    targetCollRatio,
    buyExecutionCollRatio,
    sellExecutionCollRatio,
  } = constantMultipleTriggerData
  const isDebtZero = vault.debt.isZero()

  const netValueUSD = lockedCollateral.times(tokenMarketPrice).minus(debt)
  const isEditing = checkIfIsEditingConstantMultiple({
    triggerData: constantMultipleTriggerData,
    state: constantMultipleState,
    isRemoveForm: constantMultipleState.currentForm === 'remove',
  })

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

  if (constantMultipleReadOnlyEnabled || isDebtZero) return null

  return (
    <ConstantMultipleDetailsLayout
      vaultId={vault.id}
      ilk={vault.ilk}
      vaultType={vaultType}
      token={token}
      isTriggerEnabled={isTriggerEnabled}
      {...constantMultipleDetailsLayoutOptionalParams}
    />
  )
}
