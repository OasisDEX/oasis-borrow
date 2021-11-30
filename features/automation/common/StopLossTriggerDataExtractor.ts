import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { last } from 'lodash'

import { TriggerRecord, TriggersData } from '../triggers/AutomationTriggersData'
import { TriggersTypes } from './enums/TriggersTypes'

function getSLLevel(rawBytes: string): BigNumber {
  const values = ethers.utils.defaultAbiCoder.decode(['uint256', 'bool', 'uint256'], rawBytes)
  const slLevel = new BigNumber(values[2].toString()).dividedBy(100)
  console.log('Parsed values', values, slLevel.toString())
  return slLevel
}

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
}

export function extractSLData(data: TriggersData): StopLossTriggerData {
  const doesStopLossExist = data.triggers ? data.triggers.length > 0 : false
  if (doesStopLossExist) {
    const slRecord: TriggerRecord | undefined = data.triggers ? last(data.triggers) : undefined
    if (!slRecord) throw data /* TODO: This is logically unreachable, revrite so typecheck works */
    return {
      isStopLossEnabled: true,
      stopLossLevel: getSLLevel(slRecord.executionParams),
      isToCollateral: slRecord.triggerType === TriggersTypes.StopLossToCollateral,
    } as StopLossTriggerData
  } else {
    return {
      isStopLossEnabled: false,
      stopLossLevel: new BigNumber(0),
    } as StopLossTriggerData
  }
}
