import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { useAutomationContext } from 'components/context'
import { checkIfIsEditingAutoBS } from 'features/automation/common/helpers/checkIfIsEditingAutoBS'
import { AUTO_SELL_FORM_CHANGE } from 'features/automation/common/state/autoBSFormChange.constants'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import { AutoSellDetailsLayout } from 'features/automation/protection/autoSell/controls/AutoSellDetailsLayout'
import { useAppConfig } from 'helpers/config'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

export function AutoSellDetailsControl() {
  const { ReadOnlyBasicBS: readOnlyAutoBSEnabled } = useAppConfig('features')
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
