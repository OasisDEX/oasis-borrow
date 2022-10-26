import BigNumber from 'bignumber.js'
import { ratioAtCollateralPrice } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { getOnCloseEstimations } from 'features/automation/common/estimations/onCloseEstimations'
import { checkIfIsEditingAutoTakeProfit } from 'features/automation/optimization/autoTakeProfit/helpers'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'

import { AutoTakeProfitDetailsLayout } from './AutoTakeProfitDetailsLayout'

interface AutoTakeProfitDetailsControlProps {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  ethMarketPrice: BigNumber
  vault: Vault
}

export function AutoTakeProfitDetailsControl({
  autoTakeProfitTriggerData,
  ethMarketPrice,
  vault,
}: AutoTakeProfitDetailsControlProps) {
  const [autoTakeProfitState] = useUIChanges<AutoTakeProfitFormChange>(AUTO_TAKE_PROFIT_FORM_CHANGE)
  const readOnlyAutoTakeProfitEnabled = useFeatureToggle('ReadOnlyAutoTakeProfit')

  const { debt, debtOffset, lockedCollateral } = vault
  const { isTriggerEnabled, executionPrice } = autoTakeProfitTriggerData
  const isDebtZero = debt.isZero()

  const { estimatedProfitOnClose } = getOnCloseEstimations({
    colMarketPrice: executionPrice,
    colOraclePrice: executionPrice,
    debt,
    debtOffset,
    ethMarketPrice,
    lockedCollateral,
    toCollateral: false,
  })
  const isEditing = checkIfIsEditingAutoTakeProfit({
    autoTakeProfitState,
    autoTakeProfitTriggerData,
    isRemoveForm: autoTakeProfitState.currentForm === 'remove',
  })

  const autoTakeProfitDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      triggerColPrice: executionPrice,
      estimatedProfit: estimatedProfitOnClose,
      triggerColRatio: ratioAtCollateralPrice({
        lockedCollateral: lockedCollateral,
        collateralPriceUSD: executionPrice,
        vaultDebt: debt,
      }),
    }),
    ...(isEditing && {
      afterTriggerColPrice: autoTakeProfitState.executionPrice,
      afterTriggerColRatio: autoTakeProfitState.executionCollRatio,
    }),
    currentColRatio: vault.collateralizationRatio.times(100),
  }

  if (readOnlyAutoTakeProfitEnabled || isDebtZero) return null

  return (
    <AutoTakeProfitDetailsLayout
      ilk={vault.ilk}
      vaultId={vault.id}
      isTriggerEnabled={isTriggerEnabled}
      token={vault.token}
      {...autoTakeProfitDetailsLayoutOptionalParams}
    />
  )
}
