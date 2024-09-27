import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { AutomationBotAggregator } from 'types/web3-v1-contracts'

import type { AutomationBotRemoveTriggersData } from './automationBotAggregator.types'

export function getRemoveAutomationBotAggregatorTriggersCallData(
  data: AutomationBotRemoveTriggersData,
  context: ContextConnected,
) {
  const { contract, chainId } = context

  return contract<AutomationBotAggregator>(
    getNetworkContracts(NetworkIds.MAINNET, chainId).automationBotAggregator,
  ).methods.removeTriggers(data.triggersId, data.removeAllowance)
}
