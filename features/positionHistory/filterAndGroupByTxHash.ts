import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'
import type { Erc4626HistoryEvent } from 'features/omni-kit/protocols/erc-4626/history/types'
import { groupBy, map } from 'lodash'

import type { PositionHistoryEvent } from './types'

/**
 * Filters and groups events by transaction hash.
 *
 * @param events - The array of events to filter and group.
 * @returns An array of events, where each event is the first event in a group with the same transaction hash,
 *          or the first event with 'Automation' in its kind if such event exists in the group.
 */
export function filterAndGroupByTxHash(
  events:
    | Partial<AjnaHistoryEvent>[]
    | Partial<AaveLikeHistoryEvent>[]
    | Partial<PositionHistoryEvent>[]
    | Partial<Erc4626HistoryEvent>[],
):
  | Partial<AjnaHistoryEvent>[]
  | Partial<AaveLikeHistoryEvent>[]
  | Partial<PositionHistoryEvent>[]
  | Partial<Erc4626HistoryEvent>[] {
  const groups = groupBy(events, 'txHash')

  return map(groups, (group) => {
    // Check if there is group with automation execution event, if so merge events and overwrite kind to automation kind
    // This merge is needed to be able to show execution event details in history
    const executionEvent = group.find((event) => event.kind?.includes('AutomationExecuted'))
    if (executionEvent) {
      return group.reduce((acc, curr) => ({ ...acc, ...curr, kind: executionEvent.kind }), {})
    }

    // fallback for all other cases
    return group.find((event) => event.kind?.includes('Automation')) || group[0]
  }) as
    | Partial<AjnaHistoryEvent>[]
    | Partial<AaveLikeHistoryEvent>[]
    | Partial<PositionHistoryEvent>[]
    | Partial<Erc4626HistoryEvent>[]
}
