import { Result } from '@ethersproject/abi'
import { CommandContractType, encodeTriggerDataByType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  AutomationBaseTriggerData,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import {
  DEFAULT_DEVIATION,
  DEFAULT_MAX_BASE_FEE_IN_GWEI,
  maxUint256,
} from 'features/automation/common/consts'
import { getTriggersByType } from 'features/automation/common/helpers'
import { AutoBSTriggerTypes } from 'features/automation/common/types'
import { zero } from 'helpers/zero'

export interface AutoBSTriggerData {
  triggerId: BigNumber
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
  isTriggerEnabled: boolean
}

interface ExtractAutoBSDataProps {
  triggersData: TriggersData
  triggerType: TriggerType
  isInGroup?: boolean
}

function mapAutoBSTriggerData(autoBSTriggers: { triggerId: number; result: Result }[]) {
  return autoBSTriggers.map((trigger) => {
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
        : DEFAULT_MAX_BASE_FEE_IN_GWEI, // handling for old command address
      isTriggerEnabled: true,
    } as AutoBSTriggerData
  })
}

export const defaultAutoBSData = {
  triggerId: zero,
  execCollRatio: zero,
  targetCollRatio: zero,
  maxBuyOrMinSellPrice: zero,
  continuous: false,
  deviation: DEFAULT_DEVIATION,
  maxBaseFeeInGwei: DEFAULT_MAX_BASE_FEE_IN_GWEI,
  isTriggerEnabled: false,
}

export function extractAutoBSData({
  triggersData,
  triggerType,
  isInGroup = false,
}: ExtractAutoBSDataProps): AutoBSTriggerData {
  if (triggersData.triggers && triggersData.triggers.length > 0) {
    const triggersList = triggersData.triggers.filter((item) => !!item.groupId === isInGroup)
    const autoBSTriggers = getTriggersByType(triggersList, [triggerType])

    if (autoBSTriggers.length) {
      return mapAutoBSTriggerData(autoBSTriggers)[0]
    }
  }

  return defaultAutoBSData
}

export function prepareAutoBSTriggerData({
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
  triggerType: AutoBSTriggerTypes
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

export function prepareAddAutoBSTriggerData({
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
  triggerType: AutoBSTriggerTypes
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
  replacedTriggerId: BigNumber
  maxBaseFeeInGwei: BigNumber
}): AutomationBotAddTriggerData {
  const baseTriggerData = prepareAutoBSTriggerData({
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
