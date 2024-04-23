import type { PositionFromUrl } from 'features/omni-kit/observables'
import type { OmniFiltersParameters } from 'features/omni-kit/types'

export const getOmniFilterConsumedProxy = async (
  events: PositionFromUrl[],
  filterFn: (params: OmniFiltersParameters) => Promise<boolean>,
) => {
  // leaving this all separate as it's easier for debugging
  const filterConsumedProxiesPromisesList = events.map((event) =>
    filterFn({ event, filterConsumed: true }),
  )
  const filteredConsumedProxies = await Promise.all(filterConsumedProxiesPromisesList)
  return filteredConsumedProxies.every(Boolean)
}
