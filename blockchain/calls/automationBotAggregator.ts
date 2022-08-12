import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { CONSTANT_MULTIPLE_GROUP_TYPE } from 'features/automation/protection/useConstantMultipleStateInitialization'
import { AutomationBotAggregator, DsProxy } from 'types/ethers-contracts'

import { TxMetaKind } from './txMeta'

export type AutomationBotAggregatorBaseTriggerData = {
  proxyAddress: string
}
export type AutomationBotAddAggregatorTriggerData = AutomationBotAggregatorBaseTriggerData & {
  groupTypeId: number
  replacedTriggerIds: any // TODO ŁW replace any https://app.shortcut.com/oazo-apps/story/5388/change-types-in-transactiondef
  triggersData: any //AutomationBotAddTriggerData[],
  kind: TxMetaKind.addTriggerGroup
}
export type AutomationBotRemoveTriggersData = AutomationBotAggregatorBaseTriggerData & {
  triggersId: any // Property 'triggersId' is incompatible with index signature. Type 'number[]' is not assignable to type 'string | number | boolean | BigNumber | undefined'.
  removeAllowance: boolean
  kind: TxMetaKind.removeTriggers
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

  return contract<AutomationBotAggregator>(automationBotAggregator).methods.addTriggerGroup(
    CONSTANT_MULTIPLE_GROUP_TYPE,
    data.replacedTriggerIds,
    data.triggersData,
  )
}

export const removeAutomationBotAggregatorTriggers: TransactionDef<AutomationBotRemoveTriggersData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    context.automationBotAggregator.address,
    getRemoveAutomationBotAggregatorTriggersCallData(data, context).encodeABI(),
  ],
}

function getRemoveAutomationBotAggregatorTriggersCallData(
  data: AutomationBotRemoveTriggersData,
  context: ContextConnected,
) {
  const { contract, automationBotAggregator } = context

  return contract<AutomationBotAggregator>(automationBotAggregator).methods.removeTriggers(
    data.triggersId,
    data.removeAllowance,
  )
}
