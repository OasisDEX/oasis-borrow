import { InstiVault } from 'blockchain/instiVault'
import { collateralPriceAtRatio, ratioAtCollateralPrice } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { zero } from 'helpers/zero'
import { useEffect } from 'react'

import { AUTO_TAKE_PROFIT_FORM_CHANGE } from './autoTakeProfitFormChange'

const INITIAL_SELECTED_PRICE_MULTIPLIER = 1.2

export function useAutoTakeProfitStateInitializator(vault: Vault | InstiVault) {
  const { uiChanges } = useAppContext()
  // const { autoTakeProfitLevel, isAutoTakeProfitEnabled, isToCollateral, triggerId } = autoTakeProfitTriggerData;
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  //   const sliderMin = TODO ŁW
  //   const selectedAutoTakeProfitCollRatioIfTriggerDoesntExist = vault.collateralizationRatio.isZero()
  // ŁW dummy initial data
  const isToCollateral = true
  const triggerId = zero
  const initialSelectedPrice = collateralPriceAtRatio({
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
      type: 'form-defaults',
      executionPrice: initialSelectedPrice,
      executionCollRatio: initialSelectedColRatio,
      toCollateral: isToCollateral,
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
  }, [triggerId.toNumber(), collateralizationRatio])

  // useEffect(() => {
  //   uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
  //     type: 'tx-details',
  //     txDetails: {},
  //   })
  //   uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
  //     type: 'current-form',
  //     currentForm: 'add',
  //   })
  // }, [collateralizationRatio])

  // because this value was hardcoded as true, Optimization was always shown as "On", regardless of feature flag
  const isAutoTakeProfitEnabled = false
  return isAutoTakeProfitEnabled
}
