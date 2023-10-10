import type { NetworkIds } from 'blockchain/networks'

export interface TriggerRecord {
  triggerId: number
  groupId?: number
  commandAddress: string
  executionParams: string // bytes triggerData from TriggerAdded event
}

export interface TriggersData {
  isAutomationDataLoaded: boolean
  isAutomationEnabled: boolean
  chainId: NetworkIds
  triggers?: TriggerRecord[]
}
