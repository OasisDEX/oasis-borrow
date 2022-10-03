import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { AutomationBaseTriggerData, AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'

export interface AutoTakeProfitTriggerData {
  // uint256 cdpId;
  // uint16 triggerType;
  executionPrice: BigNumber
  maxBaseFeeInGwei: BigNumber
  isToCollateral: boolean
}

export const defaultAutoTakeData = {
    executionPrice: new BigNumber(0),
    maxBaseFeeInGwei: new BigNumber(0),
    isToCollateral: false,
} as AutoTakeProfitTriggerData

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
    const baseTriggerData = prepareAutoTakeProfitTriggerData({ vaultData, executionPrice, maxBaseFeeInGwei, isCloseToCollateral })
    return {
        ...baseTriggerData,
        replacedTriggerId,
        kind: TxMetaKind.addTrigger,
    }
}