import { DiscoveryFiltersList } from 'features/discovery/meta'
import { DiscoveryPages, DiscoveryTableRowData } from 'features/discovery/types'

export const DISCOVERY_URL = '/discovery'

export function getDefaultSettingsState({
  filters,
  kind,
}: {
  filters: DiscoveryFiltersList
  kind: DiscoveryPages
}) {
  return {
    ...Object.keys(filters).reduce((o, key) => ({ ...o, [key]: filters[key][0].value }), {}),
    table: kind,
  }
}

export function getRowKey(i: number, row: DiscoveryTableRowData) {
  return [...(row.asset ? [row.asset] : []), ...(row.cdpId ? [row.cdpId] : []), i].join('-')
}
