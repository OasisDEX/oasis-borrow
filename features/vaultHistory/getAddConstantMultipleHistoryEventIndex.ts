import { groupHistoryEventsByHash } from './groupHistoryEventsByHash'
import type { AutomationEvent, VaultEvent } from './vaultHistoryEvents.types'

export function getAddConstantMultipleHistoryEventIndex(events: VaultEvent[]) {
  const groupedByHash = groupHistoryEventsByHash(events)

  const mostRecentConstantMultipleAddEvents = Object.keys(groupedByHash)
    .map((hash) => {
      const groupedEvents = groupedByHash[hash]

      const addAutoBuy = groupedEvents.find(
        (event) => event.kind === 'basic-buy' && event.eventType === 'added',
      )
      const addAutoSell = groupedEvents.find(
        (event) => event.kind === 'basic-sell' && event.eventType === 'added',
      )
      const removedAutoBuy = groupedEvents.find(
        (event) => event.kind === 'basic-buy' && event.eventType === 'removed' && event.groupId,
      )
      const removedAutoSell = groupedEvents.find(
        (event) => event.kind === 'basic-sell' && event.eventType === 'removed' && event.groupId,
      )

      if (addAutoBuy && addAutoSell && !(removedAutoBuy || removedAutoSell)) {
        return groupedEvents
      }

      return null
    })
    .filter((item) => item)[0] as AutomationEvent[]

  const triggerIdOfAddCMEvent = mostRecentConstantMultipleAddEvents?.[0].id

  const index = events.findIndex((item) => 'triggerId' in item && item.id === triggerIdOfAddCMEvent)

  return index === -1 ? 0 : index + 1
}
