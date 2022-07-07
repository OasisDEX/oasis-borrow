import {
  CommandContractType,
  decodeTriggerData,
  encodeTriggerDataByType,
  TriggerType,
} from '@oasisdex/automation'
import { getNetworkId } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { AutomationBaseTriggerData } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'

import { TriggerRecord, TriggersData } from '../triggers/AutomationTriggersData'

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
  triggerId: number
}

export function prepareTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
): AutomationBaseTriggerData {
  const triggerType = new BigNumber(
    isCloseToCollateral ? TriggerType.StopLossToCollateral : TriggerType.StopLossToDai,
  )
  return {
    cdpId: vaultData.id,
    triggerType,
    proxyAddress: vaultData.owner,
    triggerData: encodeTriggerDataByType(CommandContractType.CloseCommand, [
      vaultData.id.toString(),
      triggerType.toString(),
      stopLossLevel.toString(),
    ]),
  }
}

export function extractStopLossData(data: TriggersData): StopLossTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    return pickTriggerWithHighestStopLossLevel(data.triggers)
  }

  return {
    isStopLossEnabled: false,
    stopLossLevel: new BigNumber(0),
  } as StopLossTriggerData
}

function pickTriggerWithHighestStopLossLevel(triggers: TriggerRecord[]) {
  const MAINNET_ID = 1
  const GOERLI_ID = 5

  const networkId = getNetworkId() === GOERLI_ID ? GOERLI_ID : MAINNET_ID

  const decodedTriggers = triggers.map((trigger) => {
    const [, triggerType, stopLossLevel] = decodeTriggerData(
      trigger.commandAddress,
      networkId,
      trigger.executionParams,
    )
    return {
      triggerId: trigger.triggerId,
      isStopLossEnabled: true,
      stopLossLevel: new BigNumber(stopLossLevel.toString()).div(100),
      isToCollateral:
        new BigNumber(triggerType.toString()).toNumber() === TriggerType.StopLossToCollateral,
    }
  })

  return decodedTriggers.reduce((max, obj) => (max.stopLossLevel.gt(obj.stopLossLevel) ? max : obj))
}
