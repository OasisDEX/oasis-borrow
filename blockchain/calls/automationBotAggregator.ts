import { ContextConnected } from 'blockchain/network'
import { DsProxy, DummyAutomationBotAggregator } from 'types/ethers-contracts'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { contractDesc } from 'blockchain/config'
import BigNumber from 'bignumber.js'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxMetaKind } from './txMeta'
import { CONSTANT_MULTIPLE_GROUP_TYPE } from 'features/automation/protection/useConstantMultipleStateInitialization'
import { AutomationBotAddTriggerData } from './automationBot'


export type AutomationBotAggregatorBaseTriggerData = {}
export type AutomationBotAddAggregatorTriggerData = AutomationBotAggregatorBaseTriggerData & {
    // cdpId: BigNumber
    // groupId: BigNumber
    groupTypeId: number,
    replacedTriggerId: any, // TODO ŁW replace any https://app.shortcut.com/oazo-apps/story/5388/change-types-in-transactiondef 
    triggersData: any, //AutomationBotAddTriggerData[],
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
  console.log('data')
  console.log(data)
  console.log('context')
  console.log(context)
  const { contract, automationBotAggregator } = context
  console.log('contract')
  console.log(contract)
  console.log('automationBotAggregator')
  console.log(automationBotAggregator)
  console.log(`contract<DummyAutomationBotAggregator>(automationBotAggregator).methods.addTriggerGroup(
    CONSTANT_MULTIPLE_GROUP_TYPE, // groupTypeId
    data.groupId, // replacedTriggerId
    data.triggersData, // triggersData`
  ) 
  console.log(contract<DummyAutomationBotAggregator>(automationBotAggregator).methods.addTriggerGroup(
    CONSTANT_MULTIPLE_GROUP_TYPE, // groupTypeId
    [0,0], // replacedTriggerId
    data.triggersData, // triggersData
  ))

//   const dataToSupply = AutomationBotAggregatorInstance.interface.encodeFunctionData('addTriggerGroup', [
//     groupTypeId,
//     replacedTriggerId,
//     [bbTriggerData, bsTriggerData],
// ])

console.log('data.triggersData')
console.log(data.triggersData)

  return contract<DummyAutomationBotAggregator>(automationBotAggregator).methods.addTriggerGroup(
    CONSTANT_MULTIPLE_GROUP_TYPE, // groupTypeId
    [0,0], // replacedTriggerId
    data.triggersData, // triggersData
  )
}
