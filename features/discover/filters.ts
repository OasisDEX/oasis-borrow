import { getToken } from 'blockchain/tokensMetadata'
import { DiscoverFiltersListItem } from 'features/discover/meta'

export const discoverFiltersAssetItems: { [key: string]: DiscoverFiltersListItem } = {
  crvv1ethsteth: {
    value: 'CRVV1ETHSTETH',
    label: 'CURVE LP',
    icon: 'curve_full_circle_color',
  },
  eth: { value: 'ETH', label: 'ETH', icon: getToken('ETH').iconCircle },
  guniv3daiusdc1: {
    value: 'GUNIV3DAIUSDC1',
    label: 'GUNIV3DAIUSDC1',
    icon: getToken('GUNIV3DAIUSDC1').iconCircle,
  },
  guniv3daiusdc2: {
    value: 'GUNIV3DAIUSDC2',
    label: 'GUNIV3DAIUSDC2',
    icon: getToken('GUNIV3DAIUSDC2').iconCircle,
  },
  link: { value: 'LINK', label: 'LINK', icon: getToken('LINK').iconCircle },
  mana: { value: 'MANA', label: 'MANA', icon: getToken('MANA').iconCircle },
  matic: { value: 'MATIC', label: 'MATIC', icon: getToken('MATIC').iconCircle },
  wbtc: { value: 'WBTC', label: 'WBTC', icon: getToken('WBTC').iconCircle },
  wsteth: { value: 'WSTETH', label: 'WSTETH', icon: getToken('WSTETH').iconCircle },
  yfi: { value: 'YFI', label: 'YFI', icon: getToken('YFI').iconCircle },
}

export const discoverSizeFilter: DiscoverFiltersListItem[] = [
  { value: '', label: 'All sizes' },
  { value: '<100000', label: 'Under $100,000' },
  { value: '100000-250000', label: '$100,000 - $250,000' },
  { value: '250000-500000', label: '$250,000 - $500,000' },
  { value: '500000-1000000', label: '$500,000 - $1,000,000' },
  { value: '>1000000', label: 'Over $1,000,000' },
]

export const discoverMultipleFilter: DiscoverFiltersListItem[] = [
  { value: '', label: 'All multiples' },
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

export function getAssetOptions(options: DiscoverFiltersListItem[]): DiscoverFiltersListItem[] {
  const all = { value: options.map((item) => item.value).join(','), label: 'All assets' }

  return [all, ...options]
}
