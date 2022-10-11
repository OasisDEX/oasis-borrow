import { getToken } from 'blockchain/tokensMetadata'
import { discoveryBannerIcons, discoveryNavigationIconContent } from 'features/discovery/icons'
import { DiscoveryPages } from 'features/discovery/types'

export interface DiscoveryFiltersListItem {
  label: string
  value: string
  icon?: string
}
export interface DiscoveryFiltersList {
  [key: string]: DiscoveryFiltersListItem[]
}
export interface DiscoveryBanner {
  icon: JSX.Element
  link: string
}
export interface DiscoveryPageMeta {
  kind: DiscoveryPages
  endpoint: string
  iconColor: string
  iconContent: JSX.Element
  filters: DiscoveryFiltersList
  banner?: DiscoveryBanner
}

export const discoveryPagesMeta: DiscoveryPageMeta[] = [
  {
    kind: DiscoveryPages.HIGH_RISK_POSITIONS,
    endpoint: '/high-risk-positions.json',
    iconColor: '#FE665C',
    iconContent: discoveryNavigationIconContent[DiscoveryPages.HIGH_RISK_POSITIONS],
    filters: {
      asset: [
        { value: 'all', label: 'All asset' },
        { value: 'eth', label: 'ETH', icon: getToken('ETH').iconCircle },
        { value: 'dai', label: 'DAI', icon: getToken('DAI').iconCircle },
        { value: 'wbtc', label: 'WBTC', icon: getToken('WBTC').iconCircle },
      ],
      value: [
        { value: '>100k', label: 'Over $100' },
        { value: '75k-100k', label: '$75,000 - $100,000' },
        { value: '50k-75k', label: '$50,000 - $75,000' },
        { value: '<50k', label: 'Below $50,000' },
      ],
    },
    banner: {
      link: '/multiply',
      icon: discoveryBannerIcons[DiscoveryPages.HIGH_RISK_POSITIONS],
    },
  },
  {
    kind: DiscoveryPages.HIGHEST_MULTIPLY_PNL,
    endpoint: '/highest-multiply-pnl.json',
    iconColor: '#FFC700',
    iconContent: discoveryNavigationIconContent[DiscoveryPages.HIGHEST_MULTIPLY_PNL],
    filters: {},
    banner: {
      link: '/multiply',
      icon: discoveryBannerIcons[DiscoveryPages.HIGH_RISK_POSITIONS],
    },
  },
  {
    kind: DiscoveryPages.MOST_YIELD_EARNED,
    endpoint: '/most-yield-earned.json',
    iconColor: '#00E2BA',
    iconContent: discoveryNavigationIconContent[DiscoveryPages.MOST_YIELD_EARNED],
    filters: {},
    banner: {
      link: '/earn',
      icon: discoveryBannerIcons[DiscoveryPages.MOST_YIELD_EARNED],
    },
  },
  {
    kind: DiscoveryPages.LARGEST_DEBT,
    endpoint: '/largest-debt.json',
    iconColor: '#FF4DB8',
    iconContent: discoveryNavigationIconContent[DiscoveryPages.LARGEST_DEBT],
    filters: {},
    banner: {
      link: '/multiply',
      icon: discoveryBannerIcons[DiscoveryPages.LARGEST_DEBT],
    },
  },
]
