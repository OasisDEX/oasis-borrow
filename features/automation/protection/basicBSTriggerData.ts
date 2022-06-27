import { Result } from '@ethersproject/abi'
import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'
import { getTriggersByType } from 'features/automation/common/filterTriggersByType'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { zero } from 'helpers/zero'

export interface BasicSellTriggerData {
  triggerId: BigNumber
  basicSellLevel: BigNumber
  basicSellTargetLevel: BigNumber
  basicSellMinSellPrice: BigNumber
  isBasicSellContinuous: boolean
  basicSellDeviation: BigNumber
  isBasicSellEnabled: boolean
}

function mapBasicSellTriggerData(basicSellTriggers: { triggerId: number; result: Result }[]) {
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
      basicSellLevel: new BigNumber(execCollRatio.toString()).div(100),
      basicSellTargetLevel: new BigNumber(targetCollRatio.toString()).div(100),
      basicSellMinSellPrice: new BigNumber(maxBuyOrMinSellPrice.toString()).div(
        new BigNumber(10).pow(18),
      ),
      isBasicSellContinuous: continuous,
      basicSellDeviation: new BigNumber(deviation.toString()),
      isBasicSellEnabled: true,
    } as BasicSellTriggerData
  })
}

const defaultBasicSellData = {
  triggerId: zero,
  basicSellLevel: zero,
  basicSellTargetLevel: zero,
  basicSellMinSellPrice: zero,
  isBasicSellContinuous: false,
  basicSellDeviation: zero,
  isBasicSellEnabled: false,
}

export function extractBasicSellData(data: TriggersData): BasicSellTriggerData {
  if (data.triggers && data.triggers.length > 0) {
    const basicSellTriggers = getTriggersByType(data.triggers, [TriggerType.BasicSell])

    if (basicSellTriggers.length) {
      return mapBasicSellTriggerData(basicSellTriggers)[0]
    }

    return defaultBasicSellData
  }

  return defaultBasicSellData
}

type BasicBSTriggerTypes = TriggerType.BasicSell | TriggerType.BasicBuy

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
    deviation.toString(),
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
