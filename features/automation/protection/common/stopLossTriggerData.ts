import { Result } from '@ethersproject/abi'
import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'
import { getTriggersByType } from 'features/automation/common/filterTriggersByType'
import { zero } from 'helpers/zero'

import { TriggersData } from '../triggers/AutomationTriggersData'

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
  triggerId: number
}

function pickTriggerWithHighestStopLossLevel(
  stopLossTriggersData: {
    triggerId: number
    result: Result
  }[],
) {
  const mappedStopLossTriggers = stopLossTriggersData.map((trigger) => {
    const [, triggerType, stopLossLevel] = trigger.result

    return {
      triggerId: trigger.triggerId,
      isStopLossEnabled: true,
      stopLossLevel: new BigNumber(stopLossLevel.toString()).div(100),
      isToCollateral:
        new BigNumber(triggerType.toString()).toNumber() === TriggerType.StopLossToCollateral,
    }
  })

  return mappedStopLossTriggers.reduce((max, obj) =>
    max.stopLossLevel.gt(obj.stopLossLevel) ? max : obj,
  )
}

const defaultStopLossData = {
  isStopLossEnabled: false,
  stopLossLevel: zero,
} as StopLossTriggerData

export function extractStopLossData(data: TriggersData): StopLossTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    const stopLossTriggersData = getTriggersByType(data.triggers, [
      TriggerType.StopLossToCollateral,
      TriggerType.StopLossToDai,
    ])

    if (stopLossTriggersData.length) {
      return pickTriggerWithHighestStopLossLevel(stopLossTriggersData)
    }

    return defaultStopLossData
  }

  return defaultStopLossData
}

export function prepareStopLossTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
): AutomationBaseTriggerData {
  const triggerType = isCloseToCollateral
    ? TriggerType.StopLossToCollateral
    : TriggerType.StopLossToDai

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

export function prepareAddStopLossTriggerData(
  vaultData: Vault,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
  replacedTriggerId: number,
): AutomationBotAddTriggerData {
  const baseTriggerData = prepareStopLossTriggerData(vaultData, isCloseToCollateral, stopLossLevel)

  return {
    ...baseTriggerData,
    replacedTriggerId,
    kind: TxMetaKind.addTrigger,
  }
}

export function prepareRemoveStopLossTriggerData(
  vaultData: Vault,
  triggerId: number,
  removeAllowance: boolean,
): AutomationBotRemoveTriggerData {
  const baseTriggerData = prepareStopLossTriggerData(vaultData, false, new BigNumber(0))

  return {
    ...baseTriggerData,
    kind: TxMetaKind.removeTrigger,
    triggerId,
    removeAllowance,
  }
}
