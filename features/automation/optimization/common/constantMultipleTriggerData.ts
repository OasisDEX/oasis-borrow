import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  BasicBSTriggerData,
  extractBasicBSData,
} from 'features/automation/common/basicBSTriggerData'
import { resolveWithThreshold } from 'features/automation/common/helpers'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { zero } from 'helpers/zero'

const DEFAULT_MAX_BASE_FEE_IN_GWEI = 300
const DEFAULT_DEVIATION = 1

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
  deviation: new BigNumber(DEFAULT_DEVIATION),
  maxBaseFeeInGwei: new BigNumber(DEFAULT_MAX_BASE_FEE_IN_GWEI),
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
        triggerType: TriggerType.BasicBuy,
        isInGroup: true,
      }),
      [TriggerType.BasicSell]: extractBasicBSData({
        triggersData: triggersData,
        triggerType: TriggerType.BasicSell,
        isInGroup: true,
      }),
    }

    return mapConstantMultipleTriggerData(constantMultipleTriggers)
  }

  return defaultConstantMultipleData
}

export function prepareConstantMultipleResetData(
  constantMultipleState: ConstantMultipleFormChange,
  constantMultipleTriggerData: ConstantMultipleTriggerData,
) {
  // const defaultMultiple = constantMultipleState.acceptableMultipliers[Math.floor(constantMultipleState.acceptableMultipliers.length / 2) - 1]
  // const defaultCollRatio = calculateCollRatioFromMultiple(defaultMultiple)

  return {
    multiplier: 0,
    buyExecutionCollRatio: constantMultipleTriggerData.buyExecutionCollRatio,
    sellExecutionCollRatio: constantMultipleTriggerData.sellExecutionCollRatio,
    targetCollRatio: constantMultipleTriggerData.targetCollRatio,
    maxBuyPrice: constantMultipleTriggerData.minSellPrice,
    minSellPrice: constantMultipleTriggerData.maxBuyPrice,
    maxBaseFeeInGwei: constantMultipleTriggerData.maxBaseFeeInGwei,
    buyWithThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: constantMultipleTriggerData.maxBuyPrice,
      triggerId: constantMultipleTriggerData.triggersId[0],
    }),
    sellWithThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: constantMultipleTriggerData.minSellPrice,
      triggerId: constantMultipleTriggerData.triggersId[1],
    }),
    txDetails: {},
  }
}
