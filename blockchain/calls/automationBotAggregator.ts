import { ContextConnected } from 'blockchain/network'
import { DsProxy, DummyAutomationBotAggregator } from 'types/ethers-contracts'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { contractDesc } from 'blockchain/config'
import BigNumber from 'bignumber.js'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxMetaKind } from './txMeta'


export type AutomationBotAggregatorBaseTriggerData = {}

export type AutomationBotAddAggregatorTriggerData = AutomationBotAggregatorBaseTriggerData & {
    cdpId: BigNumber
    groupId: BigNumber
    // triggerIds: BigNumber[]
    triggerIds: string
    kind: TxMetaKind.addTrigger
    proxyAddress: string

}


export const addAutomationBotAggregatorTrigger: TransactionDef<AutomationBotAddAggregatorTriggerData> = {
    call: ({ proxyAddress }, { contract }) => {
      return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
    },
    prepareArgs: (data, context) => [
      context.automationBot.address,
      getAddAutomationAggregatotTriggerCallData(data, context).encodeABI(),
    ],
  }

function getAddAutomationAggregatotTriggerCallData(
  data: AutomationBotAddAggregatorTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBotAggregator } = context
  return contract<DummyAutomationBotAggregator>(automationBotAggregator).methods.addTriggerGroup(
    data.cdpId,
    data.groupId,
    data.triggerIds,
  )
}
