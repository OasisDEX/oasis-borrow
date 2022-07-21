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
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { zero } from 'helpers/zero'

export const maxUint32 = new BigNumber('0xFFFFFFFF')
export const maxUint256 = new BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  16,
)

export interface BasicBSTriggerData {
  triggerId: BigNumber
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
  isTriggerEnabled: boolean
}

type BasicBSTriggerTypes = TriggerType.BasicSell | TriggerType.BasicBuy

function mapBasicBSTriggerData(basicSellTriggers: { triggerId: number; result: Result }[]) {
  return basicSellTriggers.map((trigger) => {
    const [
      ,
      ,
      execCollRatio,
      targetCollRatio,
      maxBuyOrMinSellPrice,
      continuous,
      deviation,
      maxBaseFeeInGwei,
    ] = trigger.result

    /*
     * TRANSFORMATION INFO:
     * execCollRatio - 200% -> (20000 / 100 = 200%)
     * targetCollRatio - 250% -> (25000 / 100 = 250%)
     * deviation - 1% -> (100 / 100 =  1%)
     * maxBaseFeeInGwei - 500 gwei -> (500 = 500 gwei)
     * maxBuyOrMinSellPrice - 2000$ -> (2000 * 10^18 / 10^18 = 2000$)
     */

    return {
      triggerId: new BigNumber(trigger.triggerId),
      execCollRatio: new BigNumber(execCollRatio.toString()).div(100),
      targetCollRatio: new BigNumber(targetCollRatio.toString()).div(100),
      maxBuyOrMinSellPrice: new BigNumber(maxBuyOrMinSellPrice.toString()).isEqualTo(maxUint256)
        ? maxUint256
        : new BigNumber(maxBuyOrMinSellPrice.toString()).div(new BigNumber(10).pow(18)),
      continuous,
      deviation: new BigNumber(deviation.toString()).div(100),
      maxBaseFeeInGwei: maxBaseFeeInGwei
        ? new BigNumber(maxBaseFeeInGwei.toString())
        : new BigNumber(300), // handling for old command address
      isTriggerEnabled: true,
    } as BasicBSTriggerData
  })
}

const defaultBasicSellData = {
  triggerId: zero,
  execCollRatio: zero,
  targetCollRatio: zero,
  maxBuyOrMinSellPrice: zero,
  continuous: false,
  deviation: new BigNumber(1),
  maxBaseFeeInGwei: new BigNumber(300),
  isTriggerEnabled: false,
}

export function extractBasicBSData(data: TriggersData, type: TriggerType): BasicBSTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    const basicBSTriggers = getTriggersByType(data.triggers, [type])

    if (basicBSTriggers.length) {
      return mapBasicBSTriggerData(basicBSTriggers)[0]
    }
  }

  return defaultBasicSellData
}

export function prepareBasicBSTriggerData({
  vaultData,
  triggerType,
  execCollRatio,
  targetCollRatio,
  maxBuyOrMinSellPrice,
  continuous,
  deviation,
  maxBaseFeeInGwei,
}: {
  vaultData: Vault
  triggerType: BasicBSTriggerTypes
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
}): AutomationBaseTriggerData {
  const data = [
    vaultData.id.toString(),
    triggerType.toString(),
    execCollRatio.times(100).toString(),
    targetCollRatio.times(100).toString(),
    maxBuyOrMinSellPrice.isEqualTo(maxUint256)
      ? maxUint256.toString()
      : maxBuyOrMinSellPrice.times(new BigNumber(10).pow(18)).toString(),
    continuous.toString(),
    deviation.times(100).toString(),
    maxBaseFeeInGwei.toString(),
  ]

  const commands = {
    [TriggerType.BasicSell]: CommandContractType.BasicSellCommand,
    [TriggerType.BasicBuy]: CommandContractType.BasicBuyCommand,
  }

  return {
    cdpId: vaultData.id,
    triggerType,
    proxyAddress: vaultData.owner,
    triggerData: encodeTriggerDataByType(commands[triggerType], data),
  }
}

export function prepareAddBasicBSTriggerData({
  vaultData,
  triggerType,
  execCollRatio,
  targetCollRatio,
  maxBuyOrMinSellPrice,
  continuous,
  deviation,
  replacedTriggerId,
  maxBaseFeeInGwei,
}: {
  vaultData: Vault
  triggerType: BasicBSTriggerTypes
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
  replacedTriggerId: BigNumber
  maxBaseFeeInGwei: BigNumber
}): AutomationBotAddTriggerData {
  const baseTriggerData = prepareBasicBSTriggerData({
    vaultData,
    triggerType,
    execCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice,
    continuous,
    deviation,
    maxBaseFeeInGwei,
  })

  return {
    ...baseTriggerData,
    replacedTriggerId: replacedTriggerId.toNumber(),
    kind: TxMetaKind.addTrigger,
  }
}

export function prepareRemoveBasicBSTriggerData({
  vaultData,
  triggerType,
  triggerId,
}: {
  vaultData: Vault
  triggerType: BasicBSTriggerTypes
  triggerId: BigNumber
}): AutomationBotRemoveTriggerData {
  const baseTriggerData = prepareBasicBSTriggerData({
    vaultData,
    triggerType,
    execCollRatio: zero,
    targetCollRatio: zero,
    maxBuyOrMinSellPrice: zero,
    continuous: false,
    deviation: zero,
    maxBaseFeeInGwei: zero,
  })

  return {
    ...baseTriggerData,
    kind: TxMetaKind.removeTrigger,
    triggerId: triggerId.toNumber(),
    removeAllowance: false,
  }
}
