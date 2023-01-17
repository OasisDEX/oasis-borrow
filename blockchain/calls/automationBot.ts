import { TriggerGroupType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import * as accountImplementation from 'blockchain/abi/account-implementation.json'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import {
  AccountImplementation,
  AutomationBot,
  AutomationBotV2,
  DsProxy,
} from 'types/ethers-contracts'

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

// any's below because TxMeta is somehow not compatible with arrays
export type AutomationBotV2AddTriggerData = {
  kind: TxMetaKind.addTrigger
  proxyAddress: string
  replacedTriggerIds: any // BigNumber[]
  triggersData: any // string[]
  triggerTypes: any // number[]
  continuous: any // boolean[]
}

export type AutomationBotV2RemoveTriggerData = {
  kind: TxMetaKind.removeTriggers
  proxyAddress: string
  triggersIds: any // number[]
  triggersData: any // string[]
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

function getAddAutomationV2TriggerCallData(
  data: AutomationBotV2AddTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBotV2 } = context

  return contract<AutomationBotV2>(automationBotV2).methods.addTriggers(
    TriggerGroupType.SingleTrigger,
    data.continuous,
    data.replacedTriggerIds,
    data.triggersData,
    data.triggerTypes,
  )
}

function getRemoveAutomationV2TriggerCallData(
  data: AutomationBotV2RemoveTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBotV2 } = context

  return contract<AutomationBotV2>(automationBotV2).methods.removeTriggers(
    data.triggersIds,
    data.triggersData,
    data.removeAllowance,
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

export const addAutomationBotTriggerV2: TransactionDef<AutomationBotV2AddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<AccountImplementation>(contractDesc(accountImplementation, proxyAddress))
      .methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    context.automationBotV2.address,
    getAddAutomationV2TriggerCallData(data, context).encodeABI(),
  ],
}

export const removeAutomationBotTriggerV2: TransactionDef<AutomationBotV2RemoveTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<AccountImplementation>(contractDesc(accountImplementation, proxyAddress))
      .methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    context.automationBotV2.address,
    getRemoveAutomationV2TriggerCallData(data, context).encodeABI(),
  ],
}
