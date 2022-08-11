import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { AutomationBotAddAggregatorTriggerData } from 'blockchain/calls/automationBotAggregator'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Vault } from 'blockchain/vaults'
import { prepareAddBasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { CONSTANT_MULTIPLE_GROUP_TYPE } from 'features/automation/protection/useConstantMultipleStateInitialization'

export function prepareAddConstantMultipleTriggerData({
  triggersId,
  vaultData,
  maxBuyPrice,
  minSellPrice,
  buyExecutionCollRatio,
  sellExecutionCollRatio,
  targetCollRatio,
  continuous,
  deviation,
  maxBaseFeeInGwei,
}: {
  triggersId: BigNumber[]
  vaultData: Vault
  maxBuyPrice: BigNumber
  minSellPrice: BigNumber
  buyExecutionCollRatio: BigNumber
  sellExecutionCollRatio: BigNumber
  targetCollRatio: BigNumber
  continuous: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
}): AutomationBotAddAggregatorTriggerData {
  const buyTriggerData = prepareAddBasicBSTriggerData({
    vaultData,
    triggerType: TriggerType.BasicBuy,
    execCollRatio: buyExecutionCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice: maxBuyPrice,
    continuous,
    deviation,
    replacedTriggerId: triggersId[0],
    maxBaseFeeInGwei,
  })
  const sellTriggerData = prepareAddBasicBSTriggerData({
    vaultData,
    triggerType: TriggerType.BasicSell,
    execCollRatio: sellExecutionCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice: minSellPrice,
    continuous,
    deviation,
    replacedTriggerId: triggersId[1],
    maxBaseFeeInGwei,
  })

  return {
    groupTypeId: CONSTANT_MULTIPLE_GROUP_TYPE,
    replacedTriggerIds: [triggersId[0].toNumber(), triggersId[1].toNumber()],
    triggersData: [buyTriggerData.triggerData, sellTriggerData.triggerData],
    proxyAddress: vaultData.owner,
    kind: TxMetaKind.addTriggerGroup,
  }
}
