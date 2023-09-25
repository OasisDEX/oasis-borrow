import * as accountImplementation from 'blockchain/abi/account-implementation.json'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { contractDesc, NetworkIds } from 'blockchain/networks'
import type { AccountImplementation, DsProxy } from 'types/web3-v1-contracts'

import {
  getAddAutomationTriggerCallData,
  getAddAutomationV2TriggerCallData,
  getRemoveAutomationV2TriggerCallData,
} from './automationBot'
import type {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from './automationBot.types'

export const addAutomationBotTrigger: TransactionDef<AutomationBotAddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    getNetworkContracts(NetworkIds.MAINNET, context.chainId).automationBot.address,
    getAddAutomationTriggerCallData(data, context).encodeABI(),
  ],
}

export const addAutomationBotTriggerV2: TransactionDef<AutomationBotV2AddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<AccountImplementation>(contractDesc(accountImplementation, proxyAddress))
      .methods['execute']
  },
  prepareArgs: (data, context) => [
    getNetworkContracts(NetworkIds.MAINNET, context.chainId).automationBotV2.address,
    getAddAutomationV2TriggerCallData(data, context).encodeABI(),
  ],
}

export const removeAutomationBotTriggerV2: TransactionDef<AutomationBotV2RemoveTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<AccountImplementation>(contractDesc(accountImplementation, proxyAddress))
      .methods['execute']
  },
  prepareArgs: (data, context) => [
    getNetworkContracts(NetworkIds.MAINNET, context.chainId).automationBotV2.address,
    getRemoveAutomationV2TriggerCallData(data, context).encodeABI(),
  ],
}
