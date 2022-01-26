import BigNumber from 'bignumber.js'
import { AutomationBaseTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { constants, ethers } from 'ethers'
import { last } from 'lodash'
import { useEffect } from 'react'

import { TriggersData } from '../triggers/AutomationTriggersData'
import { TriggersTypes } from './enums/TriggersTypes'

function decodeTriggerData(rawBytes: string) {
  const values = ethers.utils.defaultAbiCoder.decode(['uint256', 'uint16', 'uint256'], rawBytes)
  return {
    cdpId: new BigNumber(values[0].toString()),
    triggerType: new BigNumber(values[0].toString()).toNumber(),
    stopLossLevel: new BigNumber(values[2].toString()).dividedBy(100),
  }
}

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
  triggerId: number
}

export function extractSLData(data: TriggersData): StopLossTriggerData {
  console.log('data inside extractSLData')
  console.log(data)
  const doesStopLossExist = data.triggers ? data.triggers.length > 0 : false
  if (doesStopLossExist) {
    const stopLossRecord = last(data.triggers)

    // TODO: This is logically unreachable, rewrite so typecheck works
    if (!stopLossRecord) {
      throw data
    }

    const { stopLossLevel, triggerType } = decodeTriggerData(stopLossRecord.executionParams)
    return {
      isStopLossEnabled: true,
      stopLossLevel,
      isToCollateral: triggerType === TriggersTypes.StopLossToCollateral,
      triggerId: stopLossRecord.triggerId,
    } as StopLossTriggerData
  } else {
    return {
      isStopLossEnabled: false,
      stopLossLevel: new BigNumber(0),
    } as StopLossTriggerData
  }
}

function buildTriggerData(id: BigNumber, triggerType: number, slLevel: number): string {
  return ethers.utils.defaultAbiCoder.encode(
    ['uint256', 'uint16', 'uint256'],
    [id.toNumber(), triggerType, Math.round(slLevel)],
  )
}

export function prepareTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
): AutomationBaseTriggerData {
  const slLevel: number = stopLossLevel.toNumber()
  const triggerTypeVaue = isCloseToCollateral
    ? new BigNumber(TriggersTypes.StopLossToCollateral)
    : new BigNumber(TriggersTypes.StopLossToDai)
  return {
    cdpId: vaultData.id,
    triggerType: triggerTypeVaue,
    proxyAddress: vaultData.owner,
    commandAddress: constants.AddressZero, // TODO: add command addresses
    triggerData: buildTriggerData(vaultData.id, triggerTypeVaue.toNumber(), slLevel),
  }
}

export function determineProperDefaults(
  setSelectedSLValue: React.Dispatch<React.SetStateAction<BigNumber>>,
  startingSlRatio: BigNumber,
) {
  useEffect(() => {
    setSelectedSLValue(startingSlRatio.multipliedBy(100))
  }, [])
}
