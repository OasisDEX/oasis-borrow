import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  BasicBSTriggerData,
  extractBasicBSData,
} from 'features/automation/common/basicBSTriggerData'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { zero } from 'helpers/zero'

interface ConstantMultipleAggregatedTriggers {
  [TriggerType.BasicBuy]: BasicBSTriggerData
  [TriggerType.BasicSell]: BasicBSTriggerData
}

export interface ConstantMultipleTriggerData {
  triggersId: [BigNumber, BigNumber]
  buyExecutionCollRatio: BigNumber
  sellExecutionCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyPrice: BigNumber
  minSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
  isTriggerEnabled: boolean
}

const defaultConstantMultipleData: ConstantMultipleTriggerData = {
  triggersId: [zero, zero],
  buyExecutionCollRatio: zero,
  sellExecutionCollRatio: zero,
  targetCollRatio: zero,
  maxBuyPrice: zero,
  minSellPrice: zero,
  continuous: false,
  deviation: new BigNumber(1),
  maxBaseFeeInGwei: new BigNumber(300),
  isTriggerEnabled: false,
}

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
      [TriggerType.BasicBuy]: extractBasicBSData({
        triggersData: triggersData,
        triggerType: TriggerType.CMBasicBuy,
        isInGroup: true,
      }),
      [TriggerType.BasicSell]: extractBasicBSData({
        triggersData: triggersData,
        triggerType: TriggerType.CMBasicSell,
        isInGroup: true,
      }),
    }

    return mapConstantMultipleTriggerData(constantMultipleTriggers)
  }

  return defaultConstantMultipleData
}
