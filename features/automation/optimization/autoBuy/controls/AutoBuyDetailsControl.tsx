import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { checkIfIsEditingAutoBS } from 'features/automation/common/helpers'
import {
  AUTO_BUY_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBuyDetailsLayout } from 'features/automation/optimization/autoBuy/controls/AutoBuyDetailsLayout'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

export function AutoBuyDetailsControl() {
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')

  const [autoBuyState] = useUIChanges<AutoBSFormChange>(AUTO_BUY_FORM_CHANGE)
  const {
    positionData: { ilk, id, token, debt, lockedCollateral },
    triggerData: { autoBuyTriggerData, constantMultipleTriggerData },
  } = useAutomationContext()

  const { execCollRatio, targetCollRatio, maxBuyOrMinSellPrice, isTriggerEnabled } =
    autoBuyTriggerData
  const isDebtZero = debt.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: autoBuyTriggerData.execCollRatio.div(100),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  const isEditing = checkIfIsEditingAutoBS({
    autoBSTriggerData: autoBuyTriggerData,
    autoBSState: autoBuyState,
    isRemoveForm: autoBuyState.currentForm === 'remove',
  })

  const autoBuyDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      triggerColRatio: execCollRatio,
      nextBuyPrice: executionPrice,
      targetColRatio: targetCollRatio,
      threshold: maxBuyOrMinSellPrice,
    }),
    ...(isEditing && {
      afterTriggerColRatio: autoBuyState.execCollRatio,
      afterTargetColRatio: autoBuyState.targetCollRatio,
    }),
  }

  if (readOnlyAutoBSEnabled || isDebtZero) return null

  return (
    <AutoBuyDetailsLayout
      ilk={ilk}
      vaultId={id}
      token={token}
      autoBuyTriggerData={autoBuyTriggerData}
      isconstantMultipleEnabled={constantMultipleTriggerData.isTriggerEnabled}
      {...autoBuyDetailsLayoutOptionalParams}
    />
  )
}
