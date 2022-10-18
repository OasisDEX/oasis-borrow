import {
  discoveryFiltersAssetItems,
  discoveryMultipleFilter,
  discoverySizeFilter,
  discoveryTimeFilter,
} from 'features/discovery/filters'
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
    endpoint: '/mocks/discovery/high-risk-positions.json',
    iconColor: '#FE665C',
    iconContent: discoveryNavigationIconContent[DiscoveryPages.HIGH_RISK_POSITIONS],
    filters: {
      asset: [
        discoveryFiltersAssetItems.all,
        discoveryFiltersAssetItems.eth,
        discoveryFiltersAssetItems.wbtc,
        discoveryFiltersAssetItems.uni,
        discoveryFiltersAssetItems.link,
        discoveryFiltersAssetItems.mana,
        discoveryFiltersAssetItems.matic,
        discoveryFiltersAssetItems.gusd,
        discoveryFiltersAssetItems.curve,
        discoveryFiltersAssetItems.yfi,
      ],
      size: discoverySizeFilter,
    },
    banner: {
      link: '/multiply',
      icon: discoveryBannerIcons[DiscoveryPages.HIGH_RISK_POSITIONS],
    },
  },
  {
    kind: DiscoveryPages.HIGHEST_MULTIPLY_PNL,
    endpoint: '/mocks/discovery/highest-multiply-pnl.json',
    iconColor: '#FFC700',
    iconContent: discoveryNavigationIconContent[DiscoveryPages.HIGHEST_MULTIPLY_PNL],
    filters: {
      asset: [
        discoveryFiltersAssetItems.all,
        discoveryFiltersAssetItems.eth,
        discoveryFiltersAssetItems.wbtc,
        discoveryFiltersAssetItems.link,
        discoveryFiltersAssetItems.mana,
        discoveryFiltersAssetItems.matic,
        discoveryFiltersAssetItems.yfi,
      ],
      multiple: discoveryMultipleFilter,
      size: discoverySizeFilter,
      time: discoveryTimeFilter,
    },
    banner: {
      link: '/multiply',
      icon: discoveryBannerIcons[DiscoveryPages.HIGHEST_MULTIPLY_PNL],
    },
  },
  {
    kind: DiscoveryPages.MOST_YIELD_EARNED,
    endpoint: '/mocks/discovery/most-yield-earned.json',
    iconColor: '#00E2BA',
    iconContent: discoveryNavigationIconContent[DiscoveryPages.MOST_YIELD_EARNED],
    filters: {
      asset: [
        discoveryFiltersAssetItems.all,
        discoveryFiltersAssetItems.univ3daiusdc,
        discoveryFiltersAssetItems.stetheth,
      ],
      size: discoverySizeFilter,
      time: discoveryTimeFilter,
    },
    banner: {
      link: '/earn',
      icon: discoveryBannerIcons[DiscoveryPages.MOST_YIELD_EARNED],
    },
  },
  {
    kind: DiscoveryPages.LARGEST_DEBT,
    endpoint: '/mocks/discovery/largest-debt.json',
    iconColor: '#FF4DB8',
    iconContent: discoveryNavigationIconContent[DiscoveryPages.LARGEST_DEBT],
    filters: {
      asset: [
        discoveryFiltersAssetItems.all,
        discoveryFiltersAssetItems.eth,
        discoveryFiltersAssetItems.wbtc,
        discoveryFiltersAssetItems.uni,
        discoveryFiltersAssetItems.link,
        discoveryFiltersAssetItems.mana,
        discoveryFiltersAssetItems.matic,
        discoveryFiltersAssetItems.gusd,
        discoveryFiltersAssetItems.curve,
        discoveryFiltersAssetItems.yfi,
      ],
      size: discoverySizeFilter,
    },
    banner: {
      link: '/borrow',
      icon: discoveryBannerIcons[DiscoveryPages.LARGEST_DEBT],
    },
  },
]
