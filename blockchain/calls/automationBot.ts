import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { AutomationBot, DsProxy } from 'types/ethers-contracts'

import { TxMetaKind } from './txMeta'

export type AutomationBaseTriggerData = {
  cdpId: BigNumber
  triggerType: TriggerType
  triggerData: string
  proxyAddress: string
}

export type AutomationBotAddTriggerData = AutomationBaseTriggerData & {
  kind: TxMetaKind.addTrigger
  replacedTriggerId: number
}

export type AutomationBotRemoveTriggerData = {
  kind: TxMetaKind.removeTrigger
  proxyAddress: string
  cdpId: BigNumber
  triggerId: number
  removeAllowance: boolean
}

function getAddAutomationTriggerCallData(
  data: AutomationBotAddTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBot } = context
  return contract<AutomationBot>(automationBot).methods.addTrigger(
    data.cdpId,
    data.triggerType,
    data.replacedTriggerId,
    data.triggerData,
  )
}

export const addAutomationBotTrigger: TransactionDef<AutomationBotAddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    context.automationBot.address,
    getAddAutomationTriggerCallData(data, context).encodeABI(),
  ],
}

function getRemoveAutomationTriggerCallData(
  data: AutomationBotRemoveTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBot } = context
  return contract<AutomationBot>(automationBot).methods.removeTrigger(
    data.cdpId,
    data.triggerId,
    data.removeAllowance,
  )
}

export const removeAutomationBotTrigger: TransactionDef<AutomationBotRemoveTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    context.automationBot.address,
    getRemoveAutomationTriggerCallData(data, context).encodeABI(),
  ],
}
