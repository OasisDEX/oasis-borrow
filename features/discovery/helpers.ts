import { DiscoveryFiltersList } from 'features/discovery/meta'

export const DISCOVERY_URL = '/discovery'

export function getDefaultSettingsState({ filters }: { filters: DiscoveryFiltersList }) {
  return Object.keys(filters).reduce((o, key) => ({ ...o, [key]: filters[key][0].value }), {})
}
