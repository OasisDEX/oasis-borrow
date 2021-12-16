import BigNumber from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { AutomationBot, DsProxy } from 'types/ethers-contracts'

import { TxMetaKind } from './txMeta'

export type AutomationBaseTriggerData = {
  cdpId: BigNumber
  triggerType: BigNumber
  serviceRegistry: string
  triggerData: string
  proxyAddress: string
}

export type AutomationBotAddTriggerData = AutomationBaseTriggerData & {kind: TxMetaKind.addTrigger}

export type AutomationBotRemoveTriggerData = AutomationBaseTriggerData & {kind: TxMetaKind.removeTrigger}

function getAddAutomationTriggerCallData(
  data: AutomationBotAddTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBot } = context
  return contract<AutomationBot>(automationBot).methods.addTrigger(
    data.cdpId,
    data.triggerType,
    data.serviceRegistry,
    data.triggerData,
  ) as any
}

export const addAutomationBotTrigger: TransactionDef<AutomationBotAddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    console.log('Inside addAutomationBotTrigger', proxyAddress)
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { automationBot } = context

    console.log('Inside addAutomationBotTrigger.prepareArgs', automationBot.address)
    console.log('Inside addAutomationBotTrigger.prepareArgs - data', data)
    return [automationBot.address, getAddAutomationTriggerCallData(data, context).encodeABI()]
  },
}
// TODO ŁW refactor use template method pattern and getAddAutomationTriggerCallData
function getRemoveAutomationTriggerCallData(
  data: AutomationBotRemoveTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBot } = context
  return contract<AutomationBot>(automationBot).methods.removeTrigger(
    // data.kind= TxMetaKind.removeTrigger,
    data.cdpId,
    data.triggerType,
    data.serviceRegistry,
    true,
    data.triggerData,
  ) as any
}

export const removeAutomationBotTrigger: TransactionDef<AutomationBotRemoveTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    console.log('Inside removeAutomationBotTrigger', proxyAddress)
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { automationBot } = context

    console.log('Inside removeAutomationBotTrigger.prepareArgs', automationBot.address)
    console.log('Inside removeAutomationBotTrigger.prepareArgs - data', data)
    return [automationBot.address, getRemoveAutomationTriggerCallData(data, context).encodeABI()]
  },
}
