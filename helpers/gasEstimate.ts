import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import {
  addAutomationBotAggregatorTrigger,
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
  removeAutomationBotAggregatorTriggers,
} from 'blockchain/calls/automationBotAggregator'
import { TransactionDef } from 'blockchain/calls/callsHelpers'

export const TX_DATA_CHANGE = 'TX_DATA_CHANGE'

interface AutoAddTriggerChange {
  data: AutomationBotAddTriggerData
  transaction: TransactionDef<AutomationBotAddTriggerData>
}

interface AutoRemoveTriggerChange {
  data: AutomationBotRemoveTriggerData
  transaction: TransactionDef<AutomationBotRemoveTriggerData>
}

interface AutoAddAggregatorTriggerChange {
  data: AutomationBotAddAggregatorTriggerData
  transaction: TransactionDef<AutomationBotAddAggregatorTriggerData>
}

interface AutoRemoveAggregatorTriggerChange {
  data: AutomationBotRemoveTriggersData
  transaction: TransactionDef<AutomationBotRemoveTriggersData>
}

export type TxPayloadChange =
  | AutoAddTriggerChange
  | AutoRemoveTriggerChange
  | AutoAddAggregatorTriggerChange
  | AutoRemoveAggregatorTriggerChange
  | undefined

export type TxPayloadChangeAction =
  | {
      type: 'add-trigger'
      data: AutomationBotAddTriggerData
    }
  | {
      type: 'remove-trigger'
      data: AutomationBotRemoveTriggerData
    }
  | {
      type: 'add-aggregator-trigger'
      data: AutomationBotAddAggregatorTriggerData
    }
  | {
      type: 'remove-aggregator-trigger'
      data: AutomationBotRemoveTriggersData
    }
  | { type: 'reset' }

export function gasEstimationReducer(
  state: TxPayloadChange,
  action: TxPayloadChangeAction,
): TxPayloadChange {
  switch (action.type) {
    case 'add-trigger':
      return { data: action.data, transaction: addAutomationBotTrigger }
    case 'remove-trigger':
      return { data: action.data, transaction: removeAutomationBotTrigger }
    case 'add-aggregator-trigger':
      return { data: action.data, transaction: addAutomationBotAggregatorTrigger }
    case 'remove-aggregator-trigger':
      return { data: action.data, transaction: removeAutomationBotAggregatorTriggers }
    case 'reset':
      return undefined
    default:
      return state
  }
}
