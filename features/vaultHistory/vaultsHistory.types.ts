import type { VaultWithType, VaultWithValue } from 'blockchain/vaults.types'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'

import type { ReturnedAutomationEvent, ReturnedEvent, VaultEvent } from './vaultHistoryEvents.types'

interface ActiveTrigger {
  cdpId: string
  triggerId: number
  commandAddress: string
  triggerData: string
}
export interface CacheResult {
  events: ReturnedEvent[]
  automationEvents: ReturnedAutomationEvent[]
  activeTriggers: ActiveTrigger[]
}

export type VaultWithHistory = VaultWithValue<VaultWithType> & {
  history: VaultEvent[]
  stopLossData: StopLossTriggerData
  autoSellData: AutoBSTriggerData
}
