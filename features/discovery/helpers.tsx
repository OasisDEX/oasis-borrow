import { DiscoveryFiltersList } from 'features/discovery/meta'

export function getDefaultSettingsState({ filters }: { filters: DiscoveryFiltersList }) {
  return Object.keys(filters).reduce((o, key) => ({ ...o, [key]: filters[key][0].value }), {})
}
