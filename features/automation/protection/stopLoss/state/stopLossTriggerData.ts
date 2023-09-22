import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import type {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot.types'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import { getTriggersByType } from 'features/automation/common/helpers/getTriggersByType'
import type { TriggerDataType } from 'features/automation/common/TriggerDataType'
import { maxCoverage } from 'features/automation/protection/stopLoss/constants'

import { defaultStopLossData } from './stopLossTriggerData.constants'
import type { StopLossTriggerData } from './stopLossTriggerData.types'

function pickTriggerWithHighestStopLossLevel(stopLossTriggersData: TriggerDataType[]) {
  const mappedStopLossTriggers = stopLossTriggersData.map((trigger) => {
    const { triggerType, ltv, collRatio } = trigger.result

    const triggerTypeAsNumber = new BigNumber(triggerType).toNumber()

    const isAutomationV2Trigger = [
      TriggerType.AaveStopLossToDebtV2,
      TriggerType.AaveStopLossToCollateralV2,
      TriggerType.SparkStopLossToDebtV2,
      TriggerType.SparkStopLossToCollateralV2,
    ].includes(triggerTypeAsNumber)

    const resolvedDiv = isAutomationV2Trigger ? 10 ** 4 : 100

    const isToCollateral =
      triggerTypeAsNumber === TriggerType.StopLossToCollateral ||
      triggerTypeAsNumber === TriggerType.AaveStopLossToCollateralV2 ||
      triggerTypeAsNumber === TriggerType.SparkStopLossToCollateralV2

    return {
      triggerId: new BigNumber(trigger.triggerId),
      isStopLossEnabled: true,
      // here SL is in the following format 1.9 -> 190%, 0.7 -> 70%
      stopLossLevel: new BigNumber((ltv || collRatio).toString()).div(resolvedDiv),
      isToCollateral,
      executionParams: trigger.executionParams,
      triggerType: triggerTypeAsNumber,
    }
  })

  return mappedStopLossTriggers.reduce((acc, obj) => {
    if (
      obj.triggerType === TriggerType.AaveStopLossToDebtV2 ||
      obj.triggerType === TriggerType.AaveStopLossToCollateralV2 ||
      obj.triggerType === TriggerType.SparkStopLossToDebtV2 ||
      obj.triggerType === TriggerType.SparkStopLossToCollateralV2
    ) {
      return acc.stopLossLevel.lt(obj.stopLossLevel) ? acc : obj
    }
    return acc.stopLossLevel.gt(obj.stopLossLevel) ? acc : obj
  })
}

export function extractStopLossData(
  data: TriggersData,
  overwriteDefault?: StopLossTriggerData,
): StopLossTriggerData {
  const defaultState = overwriteDefault || defaultStopLossData
  if (data.triggers && data.triggers.length > 0) {
    const stopLossTriggersData = getTriggersByType(
      data.triggers,
      [
        TriggerType.StopLossToCollateral,
        TriggerType.StopLossToDai,
        TriggerType.AaveStopLossToDebtV2,
        TriggerType.AaveStopLossToCollateralV2,
        TriggerType.SparkStopLossToDebtV2,
        TriggerType.SparkStopLossToCollateralV2,
      ],
      data.chainId,
    )

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
  commandContractType: CommandContractType,
  owner: string,
  triggerType: TriggerType,
  isCloseToCollateral: boolean,
  stopLossLevel: BigNumber,
  debtTokenAddress: string,
  tokenAddress: string,
) {
  const triggerData = encodeTriggerDataByType(commandContractType, [
    owner, // proxy
    triggerType, // triggerType
    maxCoverage, // maxCoverage, equals to 1500 USDC
    debtTokenAddress, // debtToken
    tokenAddress, // collateralToken
    stopLossLevel.times(10 ** 2).toString(), // stop loss level
  ])

  return {
    triggerTypes: [triggerType],
    proxyAddress: owner,
    triggersData: [triggerData],
    continuous: [false],
  }
}
