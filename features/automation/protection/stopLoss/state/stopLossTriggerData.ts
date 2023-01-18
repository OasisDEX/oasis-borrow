import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { utils } from 'ethers'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { DEFAULT_MAX_BASE_FEE_IN_GWEI } from 'features/automation/common/consts'
import { getTriggersByType, TriggerDataType } from 'features/automation/common/helpers'
import { zero } from 'helpers/zero'

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
  triggerId: BigNumber
  executionParams: string
}

// could be moved to common
function getStopLossResultsV1(trigger: TriggerDataType) {
  return {
    triggerType: trigger.result[1],
    stopLossLevel: trigger.result[2],
  }
}
// could be moved to common
function getStopLossResultsV2(trigger: TriggerDataType) {
  return {
    triggerType: trigger.result[1],
    stopLossLevel: trigger.result[4],
  }
}

// could be moved to common
const resultMap: Record<
  string,
  (
    trigger: TriggerDataType,
  ) => {
    stopLossLevel: BigNumber
    triggerType: BigNumber
  }
> = {
  '0xec1bb74f5799811c0c1bff94ef76fb40abccbe4a': getStopLossResultsV2,
}

function pickTriggerWithHighestStopLossLevel(stopLossTriggersData: TriggerDataType[]) {
  const commandAddress = stopLossTriggersData[0].commandAddress

  const mappedStopLossTriggers = stopLossTriggersData.map((trigger) => {
    const { triggerType, stopLossLevel } = resultMap[trigger.commandAddress]
      ? resultMap[trigger.commandAddress](trigger)
      : getStopLossResultsV1(trigger)

    return {
      triggerId: new BigNumber(trigger.triggerId),
      isStopLossEnabled: true,
      stopLossLevel: new BigNumber(stopLossLevel.toString()).div(100),
      isToCollateral:
        new BigNumber(triggerType.toString()).toNumber() === TriggerType.StopLossToCollateral,
      executionParams: trigger.executionParams,
    }
  })

  return mappedStopLossTriggers.reduce((acc, obj) => {
    if (resultMap[commandAddress]) {
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
  executionParams: '',
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
      10, // TODO TriggerType.sth
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
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
  debtTokenAddress: string,
  tokenAddress: string,
) {
  // TODO temporary encoding until we will have command address definition within common
  const triggerData = utils.defaultAbiCoder.encode(
    ['address', 'uint16', 'address', 'address', 'uint256', 'uint32'],
    [
      owner, // proxy
      10, // triggerType // TODO we should have it from TriggerType.sth
      tokenAddress, // collateralToken
      debtTokenAddress, // debtToken
      stopLossLevel.toString(), // stop loss level
      DEFAULT_MAX_BASE_FEE_IN_GWEI.toString(), // max gas fee
    ],
  )
  return {
    triggerTypes: [10], // TODO we should have it from TriggerType.sth
    proxyAddress: owner,
    triggersData: [triggerData],
    continuous: [false],
  }
}
