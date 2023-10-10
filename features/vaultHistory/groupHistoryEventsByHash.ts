import type { VaultHistoryEvent } from './vaultHistory.types'

export function groupHistoryEventsByHash(events: VaultHistoryEvent[]) {
  return events.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.hash]: [...(acc[curr.hash] ? acc[curr.hash] : []), curr],
    }
  }, {} as Record<string, VaultHistoryEvent[]>)
}
