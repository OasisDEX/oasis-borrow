import {
  CommandContractType,
  decodeTriggerData,
  encodeTriggerDataByType,
} from '@oasisdex/automation'
import { getNetworkId } from '@oasisdex/web3-context'
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

export function extractStopLossData(data: TriggersData): StopLossTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    // TODO: Johnnie, you shouldn't take the last one here, but rather the one that's sooner to be executed (with the highest stop loss level)
    const stopLossRecord = last(data.triggers)!

    const MAINNET_ID = 1
    const GOERLI_ID = 5

    const networkId = getNetworkId() === GOERLI_ID ? GOERLI_ID : MAINNET_ID

    const [, triggerType, stopLossLevel] = decodeTriggerData(
      stopLossRecord.commandAddress,
      networkId,
      stopLossRecord.executionParams,
    )
    return {
      triggerId: stopLossRecord.triggerId,
      isStopLossEnabled: true,
      stopLossLevel: new BigNumber(stopLossLevel.toString()).div(100),
      isToCollateral:
        new BigNumber(triggerType.toString()).toNumber() === TriggerType.StopLossToCollateral,
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
