import { TriggerGroupType } from '@oasisdex/automation'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { AutomationBot, AutomationBotV2 } from 'types/web3-v1-contracts'

import type {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from './automationBot.types'

export function getAddAutomationTriggerCallData(
  data: AutomationBotAddTriggerData,
  context: ContextConnected,
) {
  const { contract, chainId } = context
  return contract<AutomationBot>(
    getNetworkContracts(NetworkIds.MAINNET, chainId).automationBot,
  ).methods.addTrigger(
    data.cdpId.toString(),
    data.triggerType,
    data.replacedTriggerId,
    data.triggerData,
  )
}

export function getAddAutomationV2TriggerCallData(
  data: AutomationBotV2AddTriggerData,
  context: ContextConnected,
) {
  const { contract, chainId } = context

  return contract<AutomationBotV2>(
    getNetworkContracts(NetworkIds.MAINNET, chainId).automationBotV2,
  ).methods.addTriggers(
    TriggerGroupType.SingleTrigger,
    data.continuous,
    data.replacedTriggerIds,
    data.triggersData,
    data.replacedTriggersData,
    data.triggerTypes,
  )
}

export function getRemoveAutomationV2TriggerCallData(
  data: AutomationBotV2RemoveTriggerData,
  context: ContextConnected,
) {
  const { contract, chainId } = context

  return contract<AutomationBotV2>(
    getNetworkContracts(NetworkIds.MAINNET, chainId).automationBotV2,
  ).methods.removeTriggers(data.triggersIds, data.triggersData, data.removeAllowance)
}
