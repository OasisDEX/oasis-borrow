import { Result } from '@ethersproject/abi'
import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { getTriggersByType } from 'features/automation/common/helpers'
import { zero } from 'helpers/zero'

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
  triggerId: BigNumber
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
      triggerId: new BigNumber(trigger.triggerId),
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

export const defaultStopLossData = {
  isStopLossEnabled: false,
  stopLossLevel: zero,
  triggerId: zero,
  isToCollateral: false,
} as StopLossTriggerData

export function extractStopLossData(
  data: TriggersData,
  overwriteDefault?: StopLossTriggerData,
): StopLossTriggerData {
  const defaultState = overwriteDefault || defaultStopLossData

  if (data.triggers && data.triggers.length > 0) {
    const stopLossTriggersData = getTriggersByType(data.triggers, [
      TriggerType.StopLossToCollateral,
      TriggerType.StopLossToDai,
    ])

    if (stopLossTriggersData.length) {
      return pickTriggerWithHighestStopLossLevel(stopLossTriggersData)
    }

    return defaultState
  }

  return defaultState
}

export function prepareStopLossTriggerData(
  id: BigNumber,
  owner: string,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
): AutomationBaseTriggerData {
  const triggerType = isCloseToCollateral
    ? TriggerType.StopLossToCollateral
    : TriggerType.StopLossToDai

  return {
    cdpId: id,
    triggerType,
    proxyAddress: owner,
    triggerData: encodeTriggerDataByType(CommandContractType.CloseCommand, [
      id.toString(),
      triggerType.toString(),
      stopLossLevel.toString(),
    ]),
  }
}

export function prepareAddStopLossTriggerData({
  id,
  owner,
  isCloseToCollateral,
  stopLossLevel,
  replacedTriggerId,
}: {
  id: BigNumber
  owner: string
  isCloseToCollateral: boolean
  stopLossLevel: BigNumber
  replacedTriggerId: number
}): AutomationBotAddTriggerData {
  const baseTriggerData = prepareStopLossTriggerData(id, owner, isCloseToCollateral, stopLossLevel)

  return {
    ...baseTriggerData,
    replacedTriggerId,
    kind: TxMetaKind.addTrigger,
  }
}
