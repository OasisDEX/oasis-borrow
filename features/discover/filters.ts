import { getToken } from 'blockchain/tokensMetadata'
import { DiscoverFiltersListItem } from 'features/discover/meta'

export const discoverFiltersAssetItems = {
  all: { value: 'all', label: 'All assets' },
  // TODO: update with nicer cuvre icon when available
  curve: { value: 'curve', label: 'CURVE', icon: getToken('CRVV1ETHSTETH').iconCircle },
  eth: { value: 'eth', label: 'ETH', icon: getToken('ETH').iconCircle },
  gusd: { value: 'gusd', label: 'GUSD', icon: getToken('GUSD').iconCircle },
  link: { value: 'link', label: 'LINK', icon: getToken('LINK').iconCircle },
  mana: { value: 'mana', label: 'MANA', icon: getToken('MANA').iconCircle },
  matic: { value: 'matic', label: 'MATIC', icon: getToken('MATIC').iconCircle },
  // TODO: update with dedicated icon when it's decided what to display here
  stetheth: { value: 'stetheth', label: 'STETH/ETH', icon: getToken('ETH').iconCircle },
  uni: { value: 'uni', label: 'UNI LP', icon: getToken('UNI').iconCircle },
  // TODO: update with dedicated icon when it's decided what to display here
  univ3daiusdc: { value: 'univ3daiusdc', label: 'UNIV3DAI/USDC', icon: getToken('ETH').iconCircle },
  wbtc: { value: 'wbtc', label: 'WBTC', icon: getToken('WBTC').iconCircle },
  yfi: { value: 'yfi', label: 'YFI', icon: getToken('YFI').iconCircle },
}

export const discoverSizeFilter: DiscoverFiltersListItem[] = [
  { value: '<100k', label: 'Under $100,000' },
  { value: '100k-250k', label: '$100,000 - $250,000' },
  { value: '250k-500k', label: '$250,000 - $500,000' },
  { value: '500k-1m', label: '$500,000 - $1,000,000' },
  { value: '>1m', label: 'Over $1,000,000' },
]

export const discoverMultipleFilter: DiscoverFiltersListItem[] = [
  { value: '1-2', label: 'Multiple: 1-2x' },
  { value: '2-3', label: 'Multiple: 2-3x' },
  { value: '>3', label: 'Multiple: over 3x' },
]

export const discoverTimeFilter: DiscoverFiltersListItem[] = [
  { value: 'all', label: 'All time' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '1y', label: '1 year' },
]
