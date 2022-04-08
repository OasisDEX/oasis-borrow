import {
  CommandContractType,
  decodeTriggerData,
  encodeTriggerDataByType,
} from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { AutomationBaseTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { last } from 'lodash'

import { TriggersData } from '../triggers/AutomationTriggersData'
import { TriggerType } from './enums/TriggersTypes'

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
  triggerId: number
}

export function extractStopLossData(data: TriggersData, network: number): StopLossTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    // TODO: Johnnie, you shouldn't take the last one here, but rather the one that's sooner to be executed (with the highest stop loss level)
    const stopLossRecord = last(data.triggers)!

    const [, triggerType, stopLossLevel] = decodeTriggerData(
      stopLossRecord.commandAddress,
      network,
      stopLossRecord.executionParams,
    )
    return {
      isStopLossEnabled: true,
      stopLossLevel: new BigNumber(stopLossLevel.toString()),
      isToCollateral:
        new BigNumber(triggerType.toString()).toNumber() === TriggerType.StopLossToCollateral,
      triggerId: stopLossRecord.triggerId,
    }
  }

  return {
    isStopLossEnabled: false,
    stopLossLevel: new BigNumber(0),
  } as StopLossTriggerData
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
    triggerData: encodeTriggerDataByType(CommandContractType.CloseCommand, [
      vaultData.id.toString(),
      triggerTypeVaue.toString(),
      stopLossLevel.toString(),
    ]),
  }
}
