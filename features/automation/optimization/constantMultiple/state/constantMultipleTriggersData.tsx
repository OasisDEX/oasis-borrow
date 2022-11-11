import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'
import { prepareAddAutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { CONSTANT_MULTIPLE_GROUP_TYPE } from 'features/automation/optimization/constantMultiple/state/useConstantMultipleStateInitialization'

export function prepareAddConstantMultipleTriggerData({
  id,
  owner,
  triggersId,
  autoBuyTriggerId,
  autoSellTriggerId,
  maxBuyPrice,
  minSellPrice,
  buyExecutionCollRatio,
  sellExecutionCollRatio,
  targetCollRatio,
  continuous,
  deviation,
  maxBaseFeeInGwei,
}: {
  id: BigNumber
  owner: string
  triggersId: BigNumber[]
  autoBuyTriggerId: BigNumber
  autoSellTriggerId: BigNumber
  maxBuyPrice: BigNumber
  minSellPrice: BigNumber
  buyExecutionCollRatio: BigNumber
  sellExecutionCollRatio: BigNumber
  targetCollRatio: BigNumber
  continuous: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
}): AutomationBotAddAggregatorTriggerData {
  const buyTriggerId = triggersId[0].isZero() ? autoBuyTriggerId : triggersId[0]
  const sellTriggerId = triggersId[1].isZero() ? autoSellTriggerId : triggersId[1]
  const buyTriggerData = prepareAddAutoBSTriggerData({
    id,
    owner,
    triggerType: TriggerType.BasicBuy,
    execCollRatio: buyExecutionCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice: maxBuyPrice,
    continuous,
    deviation,
    replacedTriggerId: buyTriggerId,
    maxBaseFeeInGwei,
  })
  const sellTriggerData = prepareAddAutoBSTriggerData({
    id,
    owner,
    triggerType: TriggerType.BasicSell,
    execCollRatio: sellExecutionCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice: minSellPrice,
    continuous,
    deviation,
    replacedTriggerId: sellTriggerId,
    maxBaseFeeInGwei,
  })

  return {
    groupTypeId: CONSTANT_MULTIPLE_GROUP_TYPE,
    replacedTriggerIds: [buyTriggerId, sellTriggerId],
    triggersData: [buyTriggerData.triggerData, sellTriggerData.triggerData],
    proxyAddress: owner,
    kind: TxMetaKind.addTriggerGroup,
  }
}

export function prepareRemoveConstantMultipleTriggerData({
  vaultData,
  triggersId,
  shouldRemoveAllowance,
}: {
  vaultData: Vault
  triggersId: BigNumber[]
  shouldRemoveAllowance: boolean
}): AutomationBotRemoveTriggersData {
  return {
    triggersId: triggersId.map((item) => item.toNumber()),
    removeAllowance: shouldRemoveAllowance,
    proxyAddress: vaultData.owner,
    kind: TxMetaKind.removeTriggers,
  }
}
