import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio, ratioAtCollateralPrice } from 'blockchain/vault.maths'
import { useAppContext } from 'components/AppContextProvider'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { useEffect } from 'react'

import { AUTO_TAKE_PROFIT_FORM_CHANGE } from './autoTakeProfitFormChange'

const INITIAL_SELECTED_PRICE_MULTIPLIER = 1.2

export function useAutoTakeProfitStateInitializator({
  debt,
  lockedCollateral,
  positionRatio,
  autoTakeProfitTriggerData,
}: {
  debt: BigNumber
  lockedCollateral: BigNumber
  positionRatio: BigNumber
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
}) {
  const { uiChanges } = useAppContext()
  const { executionPrice, isToCollateral, isTriggerEnabled, triggerId } = autoTakeProfitTriggerData

  const initialSelectedPrice = isTriggerEnabled
    ? executionPrice
    : collateralPriceAtRatio({
        colRatio: positionRatio.times(INITIAL_SELECTED_PRICE_MULTIPLIER),
        collateral: lockedCollateral,
        vaultDebt: debt,
      })

  const initialSelectedColRatio = ratioAtCollateralPrice({
    lockedCollateral: lockedCollateral,
    collateralPriceUSD: initialSelectedPrice,
    vaultDebt: debt,
  })

  useEffect(() => {
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'is-awaiting-confirmation',
      isAwaitingConfirmation: false,
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
  }, [triggerId.toNumber(), positionRatio.toNumber()])

  useEffect(() => {
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'current-form',
      currentForm: 'add',
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
  }, [positionRatio.toNumber()])

  return isTriggerEnabled
}
