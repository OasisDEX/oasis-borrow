import { DiscoverFiltersList } from 'features/discover/meta'
import { DiscoverPages, DiscoverTableRowData } from 'features/discover/types'

export const DISCOVER_URL = '/discover'

export function getDefaultSettingsState({
  filters,
  kind,
}: {
  filters: DiscoverFiltersList
  kind: DiscoverPages
}) {
  return {
    ...Object.keys(filters).reduce((o, key) => ({ ...o, [key]: filters[key][0].value }), {}),
    table: kind,
  }
}

export function getRowKey(i: number, row: DiscoverTableRowData) {
  return [...(row.asset ? [row.asset] : []), ...(row.cdpId ? [row.cdpId] : []), i].join('-')
}
