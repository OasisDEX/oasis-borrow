import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { useAutomationContext } from 'components/context'
import { calculateMultipleFromTargetCollRatio } from 'features/automation/common/helpers/calculateMultipleFromTargetCollRatio'
import { ConstantMultipleDetailsLayout } from 'features/automation/optimization/constantMultiple/controls/ConstantMultipleDetailsLayout'
import { checkIfIsEditingConstantMultiple } from 'features/automation/optimization/constantMultiple/helpers'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.constants'
import type { ConstantMultipleFormChange } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.types'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { useAppConfig } from 'helpers/config'
import {
  calculatePNLFromAddConstantMultipleEvent,
  calculateTotalCostOfConstantMultiple,
} from 'helpers/multiply/calculations'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface ConstantMultipleDetailsControlProps {
  vaultHistory: VaultHistoryEvent[]
}

export function ConstantMultipleDetailsControl({
  vaultHistory,
}: ConstantMultipleDetailsControlProps) {
  const { ConstantMultipleReadOnly: constantMultipleReadOnlyEnabled } = useAppConfig('features')

  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )

  const {
    environmentData: { tokenMarketPrice },
    positionData: { ilk, id, token, debt, lockedCollateral },
    triggerData: { constantMultipleTriggerData },
  } = useAutomationContext()

  const { isTriggerEnabled, targetCollRatio, buyExecutionCollRatio, sellExecutionCollRatio } =
    constantMultipleTriggerData
  const isDebtZero = debt.isZero()

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
      vaultId={id}
      ilk={ilk}
      token={token}
      isTriggerEnabled={isTriggerEnabled}
      {...constantMultipleDetailsLayoutOptionalParams}
    />
  )
}
