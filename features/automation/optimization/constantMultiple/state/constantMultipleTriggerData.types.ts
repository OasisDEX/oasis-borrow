import type { TriggerType } from '@oasisdex/automation'
import type BigNumber from 'bignumber.js'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'

export interface ConstantMultipleAggregatedTriggers {
  [TriggerType.BasicBuy]: AutoBSTriggerData
  [TriggerType.BasicSell]: AutoBSTriggerData
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
export interface PrepareConstantMultipleResetDataProps {
  defaultMultiplier: number
  defaultCollRatio: BigNumber
  constantMultipleTriggerData: ConstantMultipleTriggerData
}
