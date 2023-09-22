import type BigNumber from 'bignumber.js'

export interface AutoTakeProfitTriggerData {
  executionPrice: BigNumber
  isToCollateral: boolean
  isTriggerEnabled: boolean
  maxBaseFeeInGwei: BigNumber
  triggerId: BigNumber
}
