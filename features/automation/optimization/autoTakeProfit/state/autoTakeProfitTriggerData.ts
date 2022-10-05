import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'
import { TriggersData } from 'features/automation/api/automationTriggersData'

export interface AutoTakeProfitTriggerData {
  isTriggerEnabled: any
  // uint256 cdpId;
  // uint16 triggerType;
  executionPrice: BigNumber
  maxBaseFeeInGwei: BigNumber
  isToCollateral: boolean
  triggerId: BigNumber
}

export const defaultAutoTakeProfitData = {
  executionPrice: new BigNumber(0),
  maxBaseFeeInGwei: new BigNumber(0),
  isToCollateral: false,
} as AutoTakeProfitTriggerData

export function extractAutoTakeProfitData(data: TriggersData): AutoTakeProfitTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    //     const autoTakeProfitTriggersData = getTriggersByType(data.triggers, [
    //       TriggerType.AutoTakeProfitToCollateral,
    //       TriggerType.AutoTakeProfitToCollateral,
    //     ])
    // // TODO is sth like this required here ?
    //     if (autoTakeProfitTriggersData.length) {
    //       return pickTriggerWithHighestExecutionPrice(autoTakeProfitTriggersData)
    //     }

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

// function pickTriggerWithHighestExecutionPrice(
//   autoTakeProfitTriggersData: { triggerId: number; result: Result }[],
// ): AutoTakeProfitTriggerData {
//   throw new Error('Function not implemented.')
// }
