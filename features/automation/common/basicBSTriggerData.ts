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

export interface BasicBSTriggerData {
  triggerId: BigNumber
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
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
    ] = trigger.result

    return {
      triggerId: new BigNumber(trigger.triggerId),
      execCollRatio: new BigNumber(execCollRatio.toString()).div(100),
      targetCollRatio: new BigNumber(targetCollRatio.toString()).div(100),
      maxBuyOrMinSellPrice: new BigNumber(maxBuyOrMinSellPrice.toString()).div(
        new BigNumber(10).pow(18),
      ),
      continuous,
      deviation: new BigNumber(deviation.toString()).div(1000),
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
  isTriggerEnabled: false,
}

export function extractBasicBSData(data: TriggersData, type: TriggerType): BasicBSTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    const basicSellTriggers = getTriggersByType(data.triggers, [type])

    if (basicSellTriggers.length) {
      return mapBasicBSTriggerData(basicSellTriggers)[0]
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
}: {
  vaultData: Vault
  triggerType: BasicBSTriggerTypes
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
}): AutomationBaseTriggerData {
  const data = [
    vaultData.id.toString(),
    triggerType.toString(),
    execCollRatio.times(100).toString(),
    targetCollRatio.times(100).toString(),
    maxBuyOrMinSellPrice.times(new BigNumber(10).pow(18)).toString(),
    continuous.toString(),
    deviation.times(1000).toString(),
  ]

  return {
    cdpId: vaultData.id,
    triggerType,
    proxyAddress: vaultData.owner,
    triggerData: encodeTriggerDataByType(CommandContractType.BasicSellCommand, data),
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
}: {
  vaultData: Vault
  triggerType: BasicBSTriggerTypes
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
  replacedTriggerId: BigNumber
}): AutomationBotAddTriggerData {
  const baseTriggerData = prepareBasicBSTriggerData({
    vaultData,
    triggerType,
    execCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice,
    continuous,
    deviation,
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
  })

  return {
    ...baseTriggerData,
    kind: TxMetaKind.removeTrigger,
    triggerId: triggerId.toNumber(),
    removeAllowance: false,
  }
}
