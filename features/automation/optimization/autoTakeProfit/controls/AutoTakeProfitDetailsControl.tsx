import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
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

  const { debt, debtOffset, lockedCollateral, token } = vault
  const { isTriggerEnabled, executionPrice } = autoTakeProfitTriggerData
  const isDebtZero = debt.isZero()

  const triggerColPrice = amountFromWei(executionPrice, vault.token)
  const { estimatedProfitOnClose } = getOnCloseEstimations({
    colMarketPrice: triggerColPrice,
    colOraclePrice: triggerColPrice,
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
    token,
  })

  const autoTakeProfitDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      triggerColPrice,
      estimatedProfit: estimatedProfitOnClose,
      triggerColRatio: ratioAtCollateralPrice({
        lockedCollateral: lockedCollateral,
        collateralPriceUSD: triggerColPrice,
        vaultDebt: debt,
      }),
    }),
    ...(isEditing && {
      afterTriggerColPrice: autoTakeProfitState.executionPrice,
      afterTriggerColRatio: autoTakeProfitState.executionCollRatio,
    }),
    currentColRatio: vault.collateralizationRatio.times(100),
  }

  if (isDebtZero) return null

  return (
    <AutoTakeProfitDetailsLayout
      isTriggerEnabled={isTriggerEnabled}
      token={vault.token}
      {...autoTakeProfitDetailsLayoutOptionalParams}
    />
  )
}
