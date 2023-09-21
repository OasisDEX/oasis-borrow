import dsProxy from 'blockchain/abi/ds-proxy.json'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { contractDesc, NetworkIds } from 'blockchain/networks'
import type { DsProxy } from 'types/web3-v1-contracts'

import {
  getAddAutomationAggregatotTriggerCallData,
  getRemoveAutomationBotAggregatorTriggersCallData,
} from './automationBotAggregator'
import type {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from './automationBotAggregator.types'

export const addAutomationBotAggregatorTrigger: TransactionDef<AutomationBotAddAggregatorTriggerData> =
  {
    call: ({ proxyAddress }, { contract }) => {
      return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods[
        'execute(address,bytes)'
      ]
    },
    prepareArgs: (data, context) => [
      getNetworkContracts(NetworkIds.MAINNET, context.chainId).automationBotAggregator.address,
      getAddAutomationAggregatotTriggerCallData(data, context).encodeABI(),
    ],
  }
export const removeAutomationBotAggregatorTriggers: TransactionDef<AutomationBotRemoveTriggersData> =
  {
    call: ({ proxyAddress }, { contract }) => {
      return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods[
        'execute(address,bytes)'
      ]
    },
    prepareArgs: (data, context) => [
      getNetworkContracts(NetworkIds.MAINNET, context.chainId).automationBotAggregator.address,
      getRemoveAutomationBotAggregatorTriggersCallData(data, context).encodeABI(),
    ],
  }
