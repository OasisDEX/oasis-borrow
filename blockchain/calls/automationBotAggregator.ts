import { ContextConnected } from 'blockchain/network'
import { DsProxy, DummyAutomationBotAggregator } from 'types/ethers-contracts'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { contractDesc } from 'blockchain/config'
import BigNumber from 'bignumber.js'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxMetaKind } from './txMeta'
import { CONSTANT_MULTIPLE_GROUP_TYPE } from 'features/automation/protection/useConstantMultipleStateInitialization'


export type AutomationBotAggregatorBaseTriggerData = {}
export type AutomationBotAddAggregatorTriggerData = AutomationBotAggregatorBaseTriggerData & {
    cdpId: BigNumber
    groupId: BigNumber
    // triggerIds: BigNumber[]
    triggerIds: string
    kind: TxMetaKind.addTrigger
    proxyAddress: string
    triggersData: string
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
/**
 * 
 * @param data 
 * @param context 
 * @returns 
 *     addTriggerGroup(
      groupTypeId: BigNumberish,
      replacedTriggerId: BigNumberish[],
      triggersData: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
 */

function getAddAutomationAggregatotTriggerCallData(
  data: AutomationBotAddAggregatorTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBotAggregator } = context
  return contract<DummyAutomationBotAggregator>(automationBotAggregator).methods.addTriggerGroup(
    CONSTANT_MULTIPLE_GROUP_TYPE, // groupTypeId
    data.groupId, // replacedTriggerId
    data.triggersData, // triggersData
  )
}
