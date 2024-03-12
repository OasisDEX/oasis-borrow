import { find, groupBy, map } from 'lodash'

/**
 * Filters and groups events by transaction hash.
 *
 * @param events - The array of events to filter and group.
 * @returns An array of events, where each event is the first event in a group with the same transaction hash,
 *          or the first event with 'Automation' in its kind if such event exists in the group.
 */
export function filterAndGroupByTxHash(events: any[]): any[] {
  const groups = groupBy(events, 'txHash')

  return map(
    groups,
    (group) => find(group, (event) => event.kind.includes('Automation')) || group[0],
  )
}
