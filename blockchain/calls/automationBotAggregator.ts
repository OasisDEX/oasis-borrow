import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { ContextConnected } from 'blockchain/network'
import { contractDesc } from 'blockchain/networksConfig'
import { CONSTANT_MULTIPLE_GROUP_TYPE } from 'features/automation/optimization/constantMultiple/state/useConstantMultipleStateInitialization'
import { AutomationBotAggregator, DsProxy } from 'types/web3-v1-contracts'

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

export const addAutomationBotAggregatorTrigger: TransactionDef<AutomationBotAddAggregatorTriggerData> =
  {
    call: ({ proxyAddress }, { contract }) => {
      return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods[
        'execute(address,bytes)'
      ]
    },
    prepareArgs: (data, context) => [
      getNetworkContracts(context.chainId).automationBotAggregator.address,
      getAddAutomationAggregatotTriggerCallData(data, context).encodeABI(),
    ],
  }

function getAddAutomationAggregatotTriggerCallData(
  data: AutomationBotAddAggregatorTriggerData,
  context: ContextConnected,
) {
  const { contract, chainId } = context

  return contract<AutomationBotAggregator>(
    getNetworkContracts(chainId).automationBotAggregator,
  ).methods.addTriggerGroup(
    CONSTANT_MULTIPLE_GROUP_TYPE,
    data.replacedTriggerIds,
    data.triggersData,
  )
}

export const removeAutomationBotAggregatorTriggers: TransactionDef<AutomationBotRemoveTriggersData> =
  {
    call: ({ proxyAddress }, { contract }) => {
      return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods[
        'execute(address,bytes)'
      ]
    },
    prepareArgs: (data, context) => [
      getNetworkContracts(context.chainId).automationBotAggregator.address,
      getRemoveAutomationBotAggregatorTriggersCallData(data, context).encodeABI(),
    ],
  }

function getRemoveAutomationBotAggregatorTriggersCallData(
  data: AutomationBotRemoveTriggersData,
  context: ContextConnected,
) {
  const { contract, chainId } = context

  return contract<AutomationBotAggregator>(
    getNetworkContracts(chainId).automationBotAggregator,
  ).methods.removeTriggers(data.triggersId, data.removeAllowance)
}
