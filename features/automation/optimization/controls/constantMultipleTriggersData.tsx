import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { AutomationBotAddAggregatorTriggerData } from 'blockchain/calls/automationBotAggregator'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'
import { prepareBasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { CONSTANT_MULTIPLE_GROUP_TYPE } from 'features/automation/protection/useConstantMultipleStateInitialization'

export function prepareAddConstantMultipleTriggerData({
  // groupId,
  vaultData,
  maxBuyPrice,
  minSellPrice,
  buyExecutionCollRatio,
  sellExecutionCollRatio,
  // TODO ŁW - confused shall I pass threshold here or not?
  // buyWithThreshold,
  // sellWithThreshold,
  targetCollRatio,
  continuous,
  deviation,
  maxBaseFeeInGwei,
}: {
  groupId: BigNumber
  vaultData: Vault
  maxBuyPrice: BigNumber
  minSellPrice: BigNumber
  buyExecutionCollRatio: BigNumber
  sellExecutionCollRatio: BigNumber
  buyWithThreshold: boolean
  sellWithThreshold: boolean
  targetCollRatio: BigNumber
  continuous: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
}): AutomationBotAddAggregatorTriggerData {
  const buyTriggerData = prepareBasicBSTriggerData({
    vaultData,
    triggerType: TriggerType.BasicBuy,
    execCollRatio: buyExecutionCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice: maxBuyPrice,
    continuous,
    deviation,
    maxBaseFeeInGwei,
  })

  const sellTriggerData = prepareBasicBSTriggerData({
    vaultData,
    triggerType: TriggerType.BasicSell,
    execCollRatio: sellExecutionCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice: minSellPrice,
    continuous,
    deviation,
    maxBaseFeeInGwei,
  })

  return {
    // groupId,
    groupTypeId: CONSTANT_MULTIPLE_GROUP_TYPE,
    replacedTriggerIds: [0, 0],
    triggersData: [buyTriggerData.triggerData, sellTriggerData.triggerData],
    proxyAddress: vaultData.owner,
    kind: TxMetaKind.addTriggerGroup,
  }
}
