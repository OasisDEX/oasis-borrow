import { TriggerGroupType, TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import * as accountImplementation from 'blockchain/abi/account-implementation.json'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { ContextConnected } from 'blockchain/network'
import { contractDesc } from 'blockchain/networksConfig'
import {
  AccountImplementation,
  AutomationBot,
  AutomationBotV2,
  DsProxy,
} from 'types/web3-v1-contracts'

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
  replacedTriggersData: any // string[]
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
  const { contract, chainId } = context
  return contract<AutomationBot>(getNetworkContracts(chainId).automationBot).methods.addTrigger(
    data.cdpId.toString(),
    data.triggerType,
    data.replacedTriggerId,
    data.triggerData,
  )
}

function getAddAutomationV2TriggerCallData(
  data: AutomationBotV2AddTriggerData,
  context: ContextConnected,
) {
  const { contract, chainId } = context

  return contract<AutomationBotV2>(
    getNetworkContracts(chainId).automationBotV2,
  ).methods.addTriggers(
    TriggerGroupType.SingleTrigger,
    data.continuous,
    data.replacedTriggerIds,
    data.triggersData,
    data.replacedTriggersData,
    data.triggerTypes,
  )
}

function getRemoveAutomationV2TriggerCallData(
  data: AutomationBotV2RemoveTriggerData,
  context: ContextConnected,
) {
  const { contract, chainId } = context

  return contract<AutomationBotV2>(
    getNetworkContracts(chainId).automationBotV2,
  ).methods.removeTriggers(data.triggersIds, data.triggersData, data.removeAllowance)
}

export const addAutomationBotTrigger: TransactionDef<AutomationBotAddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    getNetworkContracts(context.chainId).automationBot.address,
    getAddAutomationTriggerCallData(data, context).encodeABI(),
  ],
}

export const addAutomationBotTriggerV2: TransactionDef<AutomationBotV2AddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<AccountImplementation>(contractDesc(accountImplementation, proxyAddress))
      .methods['execute']
  },
  prepareArgs: (data, context) => [
    getNetworkContracts(context.chainId).automationBotV2.address,
    getAddAutomationV2TriggerCallData(data, context).encodeABI(),
  ],
}

export const removeAutomationBotTriggerV2: TransactionDef<AutomationBotV2RemoveTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<AccountImplementation>(contractDesc(accountImplementation, proxyAddress))
      .methods['execute']
  },
  prepareArgs: (data, context) => [
    getNetworkContracts(context.chainId).automationBotV2.address,
    getRemoveAutomationV2TriggerCallData(data, context).encodeABI(),
  ],
}
