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
import { zero } from 'helpers/zero'

export interface AutoTakeProfitTriggerData {
  isTriggerEnabled: boolean
  executionPrice: BigNumber
  maxBaseFeeInGwei: BigNumber
  isToCollateral: boolean
  triggerId: BigNumber
}

export const defaultAutoTakeProfitData: AutoTakeProfitTriggerData = {
  executionPrice: zero,
  maxBaseFeeInGwei: zero,
  isToCollateral: false,
  isTriggerEnabled: false,
  triggerId: zero,
}

export function extractAutoTakeProfitData(data: TriggersData): AutoTakeProfitTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    const autoTakeProfitTriggersData = getTriggersByType(data.triggers, [
      TriggerType.AutoTakeProfitToCollateral,
      TriggerType.AutoTakeProfitToDai,
    ])

    if (autoTakeProfitTriggersData.length) {
      return pickTriggerWithLowestExecutionPrice(autoTakeProfitTriggersData)
    }

    return defaultAutoTakeProfitData
  }

  return defaultAutoTakeProfitData
}

export function prepareAutoTakeProfitTriggerData({
  vaultData,
  executionPrice,
  maxBaseFeeInGwei,
  isCloseToCollateral,
}: {
  vaultData: Vault
  executionPrice: BigNumber
  maxBaseFeeInGwei: BigNumber
  isCloseToCollateral: boolean
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
      executionPrice.toString(),
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

function pickTriggerWithLowestExecutionPrice(
  autoTakeProfitTriggersData: {
    // TODO is sth like this required here ?
    triggerId: number
    result: Result
  }[],
): AutoTakeProfitTriggerData {
  const mappedAutoTakeProfitTriggers = autoTakeProfitTriggersData.map((trigger) => {
    const [, , executionPrice, maxBaseFeeInGwei, triggerType, isTriggerEnabled] = trigger.result

    return {
      executionPrice: new BigNumber(executionPrice),
      maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
      isToCollateral: triggerType === TriggerType.AutoTakeProfitToCollateral,
      triggerId: new BigNumber(trigger.triggerId),
      isTriggerEnabled,
    }
  })

  return mappedAutoTakeProfitTriggers.reduce((min, obj) =>
    min.executionPrice.lt(obj.executionPrice) ? min : obj,
  )
}
