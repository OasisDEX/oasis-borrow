import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { getTriggersByType, TriggerDataType } from 'features/automation/common/helpers'
import { zero } from 'helpers/zero'

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
  triggerId: BigNumber
  executionParams: string
}

function pickTriggerWithHighestStopLossLevel(stopLossTriggersData: TriggerDataType[]) {
  const mappedStopLossTriggers = stopLossTriggersData.map((trigger) => {
    const { triggerType, ltv, collRatio } = trigger.result

    const triggerTypeAsNumber = new BigNumber(triggerType).toNumber()

    const isAutomationV2Trigger = [
      TriggerType.AaveStopLossToDebt,
      TriggerType.AaveStopLossToCollateral,
    ].includes(triggerTypeAsNumber)

    const resolvedDiv = isAutomationV2Trigger ? 10 ** 8 : 100

    return {
      triggerId: new BigNumber(trigger.triggerId),
      isStopLossEnabled: true,
      // here SL is in the following format 1.9 -> 190%, 0.7 -> 70%
      stopLossLevel: new BigNumber((ltv || collRatio).toString()).div(resolvedDiv),
      isToCollateral:
        triggerTypeAsNumber === TriggerType.StopLossToCollateral ||
        triggerTypeAsNumber === TriggerType.AaveStopLossToCollateral,
      executionParams: trigger.executionParams,
      triggerType: triggerTypeAsNumber,
    }
  })

  return mappedStopLossTriggers.reduce((acc, obj) => {
    if (
      obj.triggerType === TriggerType.AaveStopLossToDebt ||
      obj.triggerType === TriggerType.AaveStopLossToCollateral
    ) {
      return acc.stopLossLevel.lt(obj.stopLossLevel) ? acc : obj
    }
    return acc.stopLossLevel.gt(obj.stopLossLevel) ? acc : obj
  })
}

export const defaultStopLossData = {
  isStopLossEnabled: false,
  stopLossLevel: zero,
  triggerId: zero,
  isToCollateral: false,
  executionParams: '0x',
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
      TriggerType.AaveStopLossToDebt,
      TriggerType.AaveStopLossToCollateral,
    ])

    if (stopLossTriggersData.length) {
      return pickTriggerWithHighestStopLossLevel(stopLossTriggersData)
    }

    return defaultState
  }

  return defaultState
}

function getBaseTriggerData(
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
  const baseTriggerData = getBaseTriggerData(id, owner, isCloseToCollateral, stopLossLevel)

  return {
    ...baseTriggerData,
    replacedTriggerId,
    kind: TxMetaKind.addTrigger,
  }
}

export function prepareStopLossTriggerDataV2(
  owner: string,
  triggerType: TriggerType,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
  debtTokenAddress: string,
  tokenAddress: string,
) {
  const triggerData = encodeTriggerDataByType(CommandContractType.AaveStopLossCommand, [
    owner, // proxy
    triggerType, // triggerType
    tokenAddress, // collateralToken
    debtTokenAddress, // debtToken
    stopLossLevel.times(10 ** 6).toString(), // stop loss level
  ])

  return {
    triggerTypes: [triggerType],
    proxyAddress: owner,
    triggersData: [triggerData],
    continuous: [false],
  }
}
