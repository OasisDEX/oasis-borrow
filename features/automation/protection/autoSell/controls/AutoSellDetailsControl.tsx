import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { checkIfIsEditingAutoBS } from 'features/automation/common/helpers'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoSellDetailsLayout } from 'features/automation/protection/autoSell/controls/AutoSellDetailsLayout'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

export function AutoSellDetailsControl() {
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const {
    positionData: { debt, lockedCollateral },
    triggerData: { autoSellTriggerData },
  } = useAutomationContext()

  const [autoSellState] = useUIChanges<AutoBSFormChange>(AUTO_SELL_FORM_CHANGE)

  const { execCollRatio, targetCollRatio, maxBuyOrMinSellPrice, isTriggerEnabled } =
    autoSellTriggerData
  const isDebtZero = debt.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: execCollRatio.div(100),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })
  const isEditing = checkIfIsEditingAutoBS({
    autoBSTriggerData: autoSellTriggerData,
    autoBSState: autoSellState,
    isRemoveForm: autoSellState.currentForm === 'remove',
  })

  const autoSellDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      triggerColRatio: execCollRatio,
      nextSellPrice: executionPrice,
      targetColRatio: targetCollRatio,
      threshold: maxBuyOrMinSellPrice,
    }),
    ...(isEditing && {
      afterTriggerColRatio: autoSellState.execCollRatio,
      afterTargetColRatio: autoSellState.targetCollRatio,
    }),
  }

  if (readOnlyAutoBSEnabled || isDebtZero) return null

  return <AutoSellDetailsLayout {...autoSellDetailsLayoutOptionalParams} />
}
