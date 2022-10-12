import { InstiVault } from 'blockchain/instiVault'
import { amountFromWei } from 'blockchain/utils'
import { collateralPriceAtRatio, ratioAtCollateralPrice } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { useEffect } from 'react'

import { AUTO_TAKE_PROFIT_FORM_CHANGE } from './autoTakeProfitFormChange'

const INITIAL_SELECTED_PRICE_MULTIPLIER = 1.2

export function useAutoTakeProfitStateInitializator(
  vault: Vault | InstiVault,
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData,
) {
  const { uiChanges } = useAppContext()
  const { executionPrice, isToCollateral, isTriggerEnabled, triggerId } = autoTakeProfitTriggerData
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  const initialSelectedPrice = isTriggerEnabled
    ? amountFromWei(executionPrice, vault.token)
    : collateralPriceAtRatio({
        colRatio: vault.collateralizationRatio.times(INITIAL_SELECTED_PRICE_MULTIPLIER),
        collateral: vault.lockedCollateral,
        vaultDebt: vault.debt,
      })

  const initialSelectedColRatio = ratioAtCollateralPrice({
    lockedCollateral: vault.lockedCollateral,
    collateralPriceUSD: initialSelectedPrice,
    vaultDebt: vault.debt,
  })

  useEffect(() => {
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'trigger-id',
      triggerId,
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'form-defaults',
      executionPrice: initialSelectedPrice,
      executionCollRatio: initialSelectedColRatio,
      toCollateral: isToCollateral,
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'current-form',
      currentForm: 'add',
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
  }, [triggerId.toNumber(), collateralizationRatio])

  return isTriggerEnabled
}
