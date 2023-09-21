import { TriggerType } from '@oasisdex/automation'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import { calculateCollRatioFromMultiple } from 'features/automation/common/helpers/calculateCollRatioFromMultiple'
import { calculateMultipleFromTargetCollRatio } from 'features/automation/common/helpers/calculateMultipleFromTargetCollRatio'
import { resolveMaxBuyOrMinSellPrice } from 'features/automation/common/helpers/resolveMaxBuyOrMinSellPrice'
import { resolveWithThreshold } from 'features/automation/common/helpers/resolveWithThreshold'
import { extractAutoBSData } from 'features/automation/common/state/autoBSTriggerData'
import { zero } from 'helpers/zero'

import { defaultConstantMultipleData } from './constantMultipleTriggerData.constants'
import type {
  ConstantMultipleAggregatedTriggers,
  ConstantMultipleTriggerData,
  PrepareConstantMultipleResetDataProps,
} from './constantMultipleTriggerData.types'
import { DEFAULT_TARGET_OFFSET } from './useConstantMultipleStateInitialization.constants'

function mapConstantMultipleTriggerData(
  constantMultipleAggregatedTriggers: ConstantMultipleAggregatedTriggers,
): ConstantMultipleTriggerData {
  return {
    triggersId: [
      constantMultipleAggregatedTriggers[TriggerType.BasicBuy].triggerId,
      constantMultipleAggregatedTriggers[TriggerType.BasicSell].triggerId,
    ],
    buyExecutionCollRatio: constantMultipleAggregatedTriggers[TriggerType.BasicBuy].execCollRatio,
    sellExecutionCollRatio: constantMultipleAggregatedTriggers[TriggerType.BasicSell].execCollRatio,
    targetCollRatio: constantMultipleAggregatedTriggers[TriggerType.BasicBuy].targetCollRatio,
    maxBuyPrice: constantMultipleAggregatedTriggers[TriggerType.BasicBuy].maxBuyOrMinSellPrice,
    minSellPrice: constantMultipleAggregatedTriggers[TriggerType.BasicSell].maxBuyOrMinSellPrice,
    continuous: constantMultipleAggregatedTriggers[TriggerType.BasicBuy].continuous,
    deviation: constantMultipleAggregatedTriggers[TriggerType.BasicBuy].deviation,
    maxBaseFeeInGwei: constantMultipleAggregatedTriggers[TriggerType.BasicBuy].maxBaseFeeInGwei,
    isTriggerEnabled: constantMultipleAggregatedTriggers[TriggerType.BasicBuy].isTriggerEnabled,
  }
}

export function extractConstantMultipleData(triggersData: TriggersData) {
  if (triggersData.triggers && triggersData.triggers.length > 0) {
    const constantMultipleTriggers = {
      [TriggerType.BasicBuy]: extractAutoBSData({
        triggersData: triggersData,
        triggerType: TriggerType.BasicBuy,
        isInGroup: true,
      }),
      [TriggerType.BasicSell]: extractAutoBSData({
        triggersData: triggersData,
        triggerType: TriggerType.BasicSell,
        isInGroup: true,
      }),
    }

    return mapConstantMultipleTriggerData(constantMultipleTriggers)
  }

  return defaultConstantMultipleData
}

export function prepareConstantMultipleResetData({
  defaultMultiplier,
  defaultCollRatio,
  constantMultipleTriggerData,
}: PrepareConstantMultipleResetDataProps) {
  const {
    triggersId,
    targetCollRatio,
    buyExecutionCollRatio,
    sellExecutionCollRatio,
    minSellPrice,
    maxBuyPrice,
    maxBaseFeeInGwei,
  } = constantMultipleTriggerData
  const multiplier = targetCollRatio.gt(zero)
    ? calculateMultipleFromTargetCollRatio(targetCollRatio).decimalPlaces(2).toNumber()
    : defaultMultiplier

  return {
    multiplier: multiplier,
    targetCollRatio: calculateCollRatioFromMultiple(multiplier),
    buyExecutionCollRatio: targetCollRatio.gt(zero)
      ? buyExecutionCollRatio
      : defaultCollRatio.plus(DEFAULT_TARGET_OFFSET),
    sellExecutionCollRatio: targetCollRatio.gt(zero)
      ? sellExecutionCollRatio
      : defaultCollRatio.minus(DEFAULT_TARGET_OFFSET),
    minSellPrice: resolveMaxBuyOrMinSellPrice(minSellPrice),
    maxBuyPrice: resolveMaxBuyOrMinSellPrice(maxBuyPrice),
    maxBaseFeeInGwei,
    buyWithThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: maxBuyPrice,
      triggerId: triggersId[0],
    }),
    sellWithThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: minSellPrice,
      triggerId: triggersId[1],
    }),
    isEditing: false,
  }
}
