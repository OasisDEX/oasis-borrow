import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  BasicBSTriggerData,
  extractBasicBSData,
} from 'features/automation/common/basicBSTriggerData'
import {
  calculateCollRatioFromMultiple,
  calculateMultipleFromTargetCollRatio,
  resolveMaxBuyOrMinSellPrice,
  resolveWithThreshold,
} from 'features/automation/common/helpers'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { DEFAULT_TARGET_OFFSET } from 'features/automation/protection/useConstantMultipleStateInitialization'
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

interface PrepareConstantMultipleResetDataProps {
  defaultMultiplier: number
  defaultCollRatio: BigNumber
  constantMultipleTriggerData: ConstantMultipleTriggerData
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
    txDetails: {},
  }
}
