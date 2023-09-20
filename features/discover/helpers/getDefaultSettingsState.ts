import type { DiscoverFiltersList } from 'features/discover/meta'
import type { DiscoverPages } from 'features/discover/types'
import { DiscoverFilterType } from 'features/discover/types'

export function getDefaultSettingsState({
  filters,
  kind,
}: {
  filters: DiscoverFiltersList
  kind: DiscoverPages
}) {
  return {
    ...Object.keys(filters).reduce(
      (o, key) => ({
        ...o,
        [key]:
          filters[key].type === DiscoverFilterType.SINGLE
            ? filters[key].options[0].value
            : filters[key].options.map((item) => item.value).join(','),
      }),
      {},
    ),
    table: kind,
  }
}
