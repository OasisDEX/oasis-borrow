import type BigNumber from 'bignumber.js'

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
  triggerId: BigNumber
  executionParams: string
}
