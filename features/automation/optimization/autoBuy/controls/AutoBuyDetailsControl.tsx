import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { checkIfEditingAutoBS } from 'features/automation/common/helpers'
import {
  AUTO_BUY_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutoBuyDetailsLayout } from 'features/automation/optimization/autoBuy/controls/AutoBuyDetailsLayout'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Grid } from 'theme-ui'

interface AutoBuyDetailsControlProps {
  vault: Vault
  autoBuyTriggerData: AutoBSTriggerData
}

export function AutoBuyDetailsControl({ vault, autoBuyTriggerData }: AutoBuyDetailsControlProps) {
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const [autoBuyState] = useUIChanges<AutoBSFormChange>(AUTO_BUY_FORM_CHANGE)
  const {
    execCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice,
    isTriggerEnabled,
  } = autoBuyTriggerData
  const isDebtZero = vault.debt.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: autoBuyTriggerData.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const isEditing = checkIfEditingAutoBS({
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

  if (readOnlyAutoBSEnabled) {
    return null
  }

  if (isDebtZero) {
    return null
  }

  return (
    <Grid>
      <AutoBuyDetailsLayout
        token={vault.token}
        autoBuyTriggerData={autoBuyTriggerData}
        {...autoBuyDetailsLayoutOptionalParams}
      />
    </Grid>
  )
}
