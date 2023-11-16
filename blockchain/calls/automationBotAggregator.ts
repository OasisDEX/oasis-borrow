import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { CONSTANT_MULTIPLE_GROUP_TYPE } from 'features/automation/optimization/constantMultiple/state/useConstantMultipleStateInitialization.constants'
import type { AutomationBotAggregator } from 'types/web3-v1-contracts'

import type {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from './automationBotAggregator.types'

export function getAddAutomationAggregatotTriggerCallData(
  data: AutomationBotAddAggregatorTriggerData,
  context: ContextConnected,
) {
  const { contract, chainId } = context

  return contract<AutomationBotAggregator>(
    getNetworkContracts(NetworkIds.MAINNET, chainId).automationBotAggregator,
  ).methods.addTriggerGroup(
    CONSTANT_MULTIPLE_GROUP_TYPE,
    data.replacedTriggerIds.map((id: BigNumber) =>
      BigNumber.isBigNumber(id) ? id.toString() : id,
    ),
    data.triggersData,
  )
}

export function getRemoveAutomationBotAggregatorTriggersCallData(
  data: AutomationBotRemoveTriggersData,
  context: ContextConnected,
) {
  const { contract, chainId } = context

  return contract<AutomationBotAggregator>(
    getNetworkContracts(NetworkIds.MAINNET, chainId).automationBotAggregator,
  ).methods.removeTriggers(data.triggersId, data.removeAllowance)
}
