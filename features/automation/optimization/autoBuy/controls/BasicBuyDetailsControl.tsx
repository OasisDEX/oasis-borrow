import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { checkIfEditingAutoBS } from 'features/automation/common/helpers'
import {
  AUTO_BUY_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { BasicBuyDetailsLayout } from 'features/automation/optimization/autoBuy/controls/BasicBuyDetailsLayout'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Grid } from 'theme-ui'

interface BasicBuyDetailsControlProps {
  vault: Vault
  basicBuyTriggerData: AutoBSTriggerData
}

export function BasicBuyDetailsControl({
  vault,
  basicBuyTriggerData,
}: BasicBuyDetailsControlProps) {
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyAutoBS')
  const [autoBuyState] = useUIChanges<AutoBSFormChange>(AUTO_BUY_FORM_CHANGE)
  const { execCollRatio, targetCollRatio, maxBuyOrMinSellPrice } = basicBuyTriggerData
  const isDebtZero = vault.debt.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: basicBuyTriggerData.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const isEditing = checkIfEditingAutoBS({
    autoBSTriggerData: basicBuyTriggerData,
    autoBSState: autoBuyState,
    isRemoveForm: autoBuyState.currentForm === 'remove',
  })

  const basicBuyDetailsLayoutOptionalParams = {
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
      <BasicBuyDetailsLayout
        token={vault.token}
        triggerColRatio={execCollRatio}
        nextBuyPrice={executionPrice}
        targetColRatio={targetCollRatio}
        threshold={maxBuyOrMinSellPrice}
        basicBuyTriggerData={basicBuyTriggerData}
        {...basicBuyDetailsLayoutOptionalParams}
      />
    </Grid>
  )
}
