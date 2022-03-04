import BigNumber from 'bignumber.js'
import { AutomationBaseTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { ethers } from 'ethers'
import { last } from 'lodash'
import { useEffect } from 'react'

import { TriggersData } from '../triggers/AutomationTriggersData'
import { TriggerType } from './enums/TriggersTypes'

function decodeTriggerData(rawBytes: string) {
  const values = ethers.utils.defaultAbiCoder.decode(['uint256', 'uint16', 'uint256'], rawBytes)
  return {
    cdpId: new BigNumber(values[0].toString()),
    triggerType: new BigNumber(values[1].toString()).toNumber(),
    stopLossLevel: new BigNumber(values[2].toString()).dividedBy(100),
  }
}

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
  triggerId: number
}

export function extractStopLossData(data: TriggersData): StopLossTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    // TODO: Johnnie, you shouldn't take the last one here, but rather the one that's sooner to be executed (with the highest stop loss level)
    const stopLossRecord = last(data.triggers)!

    const { stopLossLevel, triggerType } = decodeTriggerData(stopLossRecord.executionParams)
    return {
      isStopLossEnabled: true,
      stopLossLevel,
      isToCollateral: triggerType === TriggerType.StopLossToCollateral,
      triggerId: stopLossRecord.triggerId,
    }
  }

  return {
    isStopLossEnabled: false,
    stopLossLevel: new BigNumber(0),
  } as StopLossTriggerData
}

function buildTriggerData(id: BigNumber, triggerType: BigNumber, slLevel: BigNumber): string {
  return ethers.utils.defaultAbiCoder.encode(
    ['uint256', 'uint16', 'uint256'],
    [id.toNumber(), triggerType.toNumber(), Math.round(slLevel.toNumber())],
  )
}

export function prepareTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
): AutomationBaseTriggerData {
  const triggerTypeVaue = new BigNumber(
    isCloseToCollateral ? TriggerType.StopLossToCollateral : TriggerType.StopLossToDai,
  )
  return {
    cdpId: vaultData.id,
    triggerType: triggerTypeVaue,
    proxyAddress: vaultData.owner,
    triggerData: buildTriggerData(vaultData.id, triggerTypeVaue, stopLossLevel),
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
