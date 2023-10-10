import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import type {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot.types'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import { getTriggersByType } from 'features/automation/common/helpers/getTriggersByType'

import type {
  AutoTakeProfitFormChange,
  AutoTakeProfitResetData,
} from './autoTakeProfitFormChange.types'
import type { AutoTakeProfitTriggerData } from './autoTakeProfitTriggerData.types'
import { defaultAutoTakeProfitData } from './defaultAutoTakeProfitData'

export function extractAutoTakeProfitData(data: TriggersData): AutoTakeProfitTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    const autoTakeProfitTriggersData = getTriggersByType(
      data.triggers,
      [TriggerType.AutoTakeProfitToCollateral, TriggerType.AutoTakeProfitToDai],
      data.chainId,
    )

    if (autoTakeProfitTriggersData.length) {
      return pickTriggerWithLowestExecutionPrice(autoTakeProfitTriggersData)
    }
  }

  return defaultAutoTakeProfitData
}

export function prepareAutoTakeProfitTriggerData({
  id,
  owner,
  executionPrice,
  isCloseToCollateral,
  maxBaseFeeInGwei,
}: {
  id: BigNumber
  owner: string
  executionPrice: BigNumber
  isCloseToCollateral: boolean
  maxBaseFeeInGwei: BigNumber
}): AutomationBaseTriggerData {
  const triggerType = isCloseToCollateral
    ? TriggerType.AutoTakeProfitToCollateral
    : TriggerType.AutoTakeProfitToDai

  return {
    cdpId: id,
    triggerType,
    proxyAddress: owner,
    triggerData: encodeTriggerDataByType(CommandContractType.AutoTakeProfitCommand, [
      id.toString(),
      triggerType.toString(),
      executionPrice
        .decimalPlaces(0, BigNumber.ROUND_DOWN)
        .times(new BigNumber(10).pow(18))
        .toString(),
      maxBaseFeeInGwei.toString(),
    ]),
  }
}

export function prepareAddAutoTakeProfitTriggerData({
  id,
  owner,
  executionPrice,
  maxBaseFeeInGwei,
  isCloseToCollateral,
  replacedTriggerId,
}: {
  id: BigNumber
  owner: string
  executionPrice: BigNumber
  maxBaseFeeInGwei: BigNumber
  isCloseToCollateral: boolean
  replacedTriggerId: number
}): AutomationBotAddTriggerData {
  const baseTriggerData = prepareAutoTakeProfitTriggerData({
    id,
    owner,
    executionPrice,
    maxBaseFeeInGwei,
    isCloseToCollateral,
  })
  return {
    ...baseTriggerData,
    replacedTriggerId,
    kind: TxMetaKind.addTrigger,
  }
}

export function pickTriggerWithLowestExecutionPrice(
  autoTakeProfitTriggersData: {
    triggerId: number
    result: Record<string, string | number | BigNumber>
  }[],
): AutoTakeProfitTriggerData {
  const mappedAutoTakeProfitTriggers = autoTakeProfitTriggersData.map((trigger) => {
    const { triggerType, executionPrice, maxBaseFeeInGwei } = trigger.result

    return {
      executionPrice: new BigNumber(executionPrice.toString()).div(new BigNumber(10).pow(18)),
      isToCollateral: triggerType === TriggerType.AutoTakeProfitToCollateral,
      isTriggerEnabled: true,
      maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei.toString()),
      triggerId: new BigNumber(trigger.triggerId),
    }
  })

  return mappedAutoTakeProfitTriggers.reduce((min, obj) =>
    min.executionPrice.lt(obj.executionPrice) ? min : obj,
  )
}

export function prepareAutoTakeProfitResetData(
  autoTakeProfitState: AutoTakeProfitFormChange,
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData,
): AutoTakeProfitResetData {
  return {
    executionCollRatio: autoTakeProfitState.defaultExecutionCollRatio,
    executionPrice: autoTakeProfitState.defaultExecutionPrice,
    isEditing: false,
    toCollateral: autoTakeProfitTriggerData.isToCollateral,
    txDetails: {},
  }
}
