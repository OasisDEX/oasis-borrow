import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'
import { Result } from 'ethers/lib/utils'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { getTriggersByType } from 'features/automation/common/helpers'
import {
  AutoTakeProfitFormChange,
  AutoTakeProfitResetData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { zero } from 'helpers/zero'

export interface AutoTakeProfitTriggerData {
  executionPrice: BigNumber
  isToCollateral: boolean
  isTriggerEnabled: boolean
  maxBaseFeeInGwei: BigNumber
  triggerId: BigNumber
}

export const defaultAutoTakeProfitData: AutoTakeProfitTriggerData = {
  executionPrice: zero,
  isToCollateral: true,
  isTriggerEnabled: false,
  maxBaseFeeInGwei: zero,
  triggerId: zero,
}

export function extractAutoTakeProfitData(data: TriggersData): AutoTakeProfitTriggerData {
  console.log(data)
  if (data.triggers && data.triggers.length > 0) {
    const autoTakeProfitTriggersData = getTriggersByType(data.triggers, [
      TriggerType.AutoTakeProfitToCollateral,
      TriggerType.AutoTakeProfitToDai,
    ])

    if (autoTakeProfitTriggersData.length) {
      return pickTriggerWithLowestExecutionPrice(autoTakeProfitTriggersData)
    }
  }

  return defaultAutoTakeProfitData
}

export function prepareAutoTakeProfitTriggerData({
  executionPrice,
  isCloseToCollateral,
  maxBaseFeeInGwei,
  vaultData,
}: {
  executionPrice: BigNumber
  isCloseToCollateral: boolean
  maxBaseFeeInGwei: BigNumber
  vaultData: Vault
}): AutomationBaseTriggerData {
  const triggerType = isCloseToCollateral
    ? TriggerType.AutoTakeProfitToCollateral
    : TriggerType.AutoTakeProfitToDai

  return {
    cdpId: vaultData.id,
    triggerType,
    proxyAddress: vaultData.owner,
    triggerData: encodeTriggerDataByType(CommandContractType.AutoTakeProfitCommand, [
      vaultData.id.toString(),
      triggerType.toString(),
      executionPrice
        .decimalPlaces(0, BigNumber.ROUND_DOWN)
        .times(new BigNumber(10).pow(18))
        .toString(),
      maxBaseFeeInGwei.toString(),
    ]),
  }
}

export function prepareAddAutoTakeProfitTriggerData(
  vaultData: Vault,
  executionPrice: BigNumber,
  maxBaseFeeInGwei: BigNumber,
  isCloseToCollateral: boolean,
  replacedTriggerId: number,
): AutomationBotAddTriggerData {
  const baseTriggerData = prepareAutoTakeProfitTriggerData({
    vaultData,
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
    // TODO is sth like this required here ?
    triggerId: number
    result: Result
  }[],
): AutoTakeProfitTriggerData {
  const mappedAutoTakeProfitTriggers = autoTakeProfitTriggersData.map((trigger) => {
    const [, triggerType, executionPrice, maxBaseFeeInGwei] = trigger.result

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
