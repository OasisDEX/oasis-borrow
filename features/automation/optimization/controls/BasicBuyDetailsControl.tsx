import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { checkIfEditingBasicBS } from 'features/automation/common/helpers'
import { BasicBuyDetailsLayout } from 'features/automation/optimization/controls/BasicBuyDetailsLayout'
import {
  BASIC_BUY_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Grid } from 'theme-ui'

interface BasicBuyDetailsControlProps {
  vault: Vault
  basicBuyTriggerData: BasicBSTriggerData
}

export function BasicBuyDetailsControl({
  vault,
  basicBuyTriggerData,
}: BasicBuyDetailsControlProps) {
  const readOnlyBasicBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const [basicBuyState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)
  const { execCollRatio, targetCollRatio, maxBuyOrMinSellPrice } = basicBuyTriggerData
  const isDebtZero = vault.debt.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: basicBuyTriggerData.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  const isEditing = checkIfEditingBasicBS({
    basicBSTriggerData: basicBuyTriggerData,
    basicBSState: basicBuyState,
    isRemoveForm: basicBuyState.currentForm === 'remove',
  })

  const basicBuyDetailsLayoutOptionalParams = {
    ...(isEditing && {
      afterTriggerColRatio: basicBuyState.execCollRatio,
      afterTargetColRatio: basicBuyState.targetCollRatio,
    }),
  }

  if (readOnlyBasicBSEnabled) {
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
