import { TriggerType } from '@oasisdex/automation'
import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import {
  calculateCollRatioFromMultiple,
  calculateMultipleFromTargetCollRatio,
  resolveWithThreshold,
} from 'features/automation/common/helpers'
import { extractConstantMultipleData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { getConstantMutliplyMinMaxValues } from 'features/automation/optimization/common/helpers'
import { getConstantMultipleMultipliers } from 'features/automation/optimization/common/multipliers'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { zero } from 'helpers/zero'
import { useEffect } from 'react'

import { CONSTANT_MULTIPLE_FORM_CHANGE } from './common/UITypes/constantMultipleFormChange'
import { TriggersData } from './triggers/AutomationTriggersData'

export const CONSTANT_MULTIPLE_GROUP_TYPE = 1

const DEFAULT_TARGET_OFFSET = 10

export function useConstantMultipleStateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  autoTriggersData: TriggersData,
) {
  const { uiChanges } = useAppContext()

  const stopLossTriggerData = extractStopLossData(autoTriggersData)
  const autoBuyTriggerData = extractBasicBSData({
    triggersData: autoTriggersData,
    triggerType: TriggerType.BasicBuy,
  })
  const {
    triggersId,
    targetCollRatio,
    buyExecutionCollRatio,
    sellExecutionCollRatio,
    maxBuyPrice,
    minSellPrice,
    continuous,
    deviation,
    maxBaseFeeInGwei,
    isTriggerEnabled,
  } = extractConstantMultipleData(autoTriggersData)
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  const { min, max } = getConstantMutliplyMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
    lockedCollateralUSD: vault.lockedCollateralUSD,
  })

  const acceptableMultipliers = getConstantMultipleMultipliers({
    ilk: ilkData.ilk,
    minColRatio: min,
    maxColRatio: max,
  })
  const defaultMultiple = acceptableMultipliers[Math.floor(acceptableMultipliers.length / 2) - 1]
  const defaultCollRatio = calculateCollRatioFromMultiple(defaultMultiple)

  useEffect(() => {
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'acceptable-multipliers',
      acceptableMultipliers: acceptableMultipliers,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'multiplier',
      multiplier: targetCollRatio.gt(zero)
        ? calculateMultipleFromTargetCollRatio(targetCollRatio).decimalPlaces(2).toNumber()
        : defaultMultiple,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'buy-execution-coll-ratio',
      buyExecutionCollRatio: targetCollRatio.gt(zero)
        ? buyExecutionCollRatio
        : defaultCollRatio.plus(DEFAULT_TARGET_OFFSET),
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'sell-execution-coll-ratio',
      sellExecutionCollRatio: targetCollRatio.gt(zero)
        ? sellExecutionCollRatio
        : defaultCollRatio.minus(DEFAULT_TARGET_OFFSET),
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'max-buy-price',
      maxBuyPrice,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'min-sell-price',
      minSellPrice,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'continuous',
      continuous,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'deviation',
      deviation,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'max-gas-fee-in-gwei',
      maxBaseFeeInGwei,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'buy-with-threshold',
      buyWithThreshold: resolveWithThreshold({
        maxBuyOrMinSellPrice: maxBuyPrice,
        triggerId: triggersId[0],
      }),
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'sell-with-threshold',
      sellWithThreshold: resolveWithThreshold({
        maxBuyOrMinSellPrice: minSellPrice,
        triggerId: triggersId[1],
      }),
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'target-ratio-ranges',
      minTargetRatio: min,
      maxTargetRatio: max,
    })
  }, [collateralizationRatio])

  return isTriggerEnabled
}
