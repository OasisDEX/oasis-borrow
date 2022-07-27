import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { CONSTANT_MULTIPLE_GROUP_TYPE } from 'features/automation/protection/useConstantMultipleStateInitialization'
import { DsProxy, DummyAutomationBotAggregator } from 'types/ethers-contracts'

import { TxMetaKind } from './txMeta'

export type AutomationBotAggregatorBaseTriggerData = {}
export type AutomationBotAddAggregatorTriggerData = AutomationBotAggregatorBaseTriggerData & {
  groupTypeId: number
  replacedTriggerIds: any // TODO ŁW replace any https://app.shortcut.com/oazo-apps/story/5388/change-types-in-transactiondef
  triggersData: any //AutomationBotAddTriggerData[],
  proxyAddress: string
  kind: TxMetaKind.addTriggerGroup
}

export const addAutomationBotAggregatorTrigger: TransactionDef<AutomationBotAddAggregatorTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    context.automationBotAggregator.address,
    getAddAutomationAggregatotTriggerCallData(data, context).encodeABI(),
  ],
}

function getAddAutomationAggregatotTriggerCallData(
  data: AutomationBotAddAggregatorTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBotAggregator } = context

  return contract<DummyAutomationBotAggregator>(automationBotAggregator).methods.addTriggerGroup(
    CONSTANT_MULTIPLE_GROUP_TYPE, // groupTypeId
    [0, 0], // replacedTriggerId
    data.triggersData, // triggersData
  )
}
