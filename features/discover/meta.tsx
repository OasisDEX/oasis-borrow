import {
  discoverFiltersAssetItems,
  discoverMultipleFilter,
  discoverSizeFilter,
  discoverTimeFilter,
  getAssetOptions,
} from 'features/discover/filters'
import { discoverBannerIcons, discoverNavigationIconContent } from 'features/discover/icons'
import { DiscoverPages } from 'features/discover/types'

export interface DiscoverFiltersListItem {
  label: string
  value: string
  icon?: string
}
export interface DiscoverFiltersList {
  [key: string]: DiscoverFiltersListItem[]
}
export interface DiscoverBanner {
  icon: JSX.Element
  link: string
}
export interface DiscoverPageMeta {
  kind: DiscoverPages
  endpoint: string
  iconColor: string
  iconContent: JSX.Element
  filters: DiscoverFiltersList
  banner?: DiscoverBanner
}

export const discoverPagesMeta: DiscoverPageMeta[] = [
  {
    kind: DiscoverPages.HIGHEST_RISK_POSITIONS,
    endpoint: '/mocks/discover/highest-risk-positions.json',
    iconColor: '#FE665C',
    iconContent: discoverNavigationIconContent[DiscoverPages.HIGHEST_RISK_POSITIONS],
    filters: {
      asset: getAssetOptions([
        discoverFiltersAssetItems.eth,
        discoverFiltersAssetItems.wbtc,
        discoverFiltersAssetItems.uni,
        discoverFiltersAssetItems.link,
        discoverFiltersAssetItems.mana,
        discoverFiltersAssetItems.matic,
        discoverFiltersAssetItems.gusd,
        discoverFiltersAssetItems.curve,
        discoverFiltersAssetItems.yfi,
      ]),
      size: discoverSizeFilter,
    },
    banner: {
      link: '/multiply',
      icon: discoverBannerIcons[DiscoverPages.HIGHEST_RISK_POSITIONS],
    },
  },
  {
    kind: DiscoverPages.HIGHEST_MULTIPLY_PNL,
    endpoint: '/mocks/discover/highest-multiply-pnl.json',
    iconColor: '#FFC700',
    iconContent: discoverNavigationIconContent[DiscoverPages.HIGHEST_MULTIPLY_PNL],
    filters: {
      asset: getAssetOptions([
        discoverFiltersAssetItems.eth,
        discoverFiltersAssetItems.wbtc,
        discoverFiltersAssetItems.link,
        discoverFiltersAssetItems.mana,
        discoverFiltersAssetItems.matic,
        discoverFiltersAssetItems.yfi,
      ]),
      multiple: discoverMultipleFilter,
      size: discoverSizeFilter,
      time: discoverTimeFilter,
    },
    banner: {
      link: '/multiply',
      icon: discoverBannerIcons[DiscoverPages.HIGHEST_MULTIPLY_PNL],
    },
  },
  {
    kind: DiscoverPages.MOST_YIELD_EARNED,
    endpoint: '/mocks/discover/most-yield-earned.json',
    iconColor: '#00E2BA',
    iconContent: discoverNavigationIconContent[DiscoverPages.MOST_YIELD_EARNED],
    filters: {
      asset: getAssetOptions([
        discoverFiltersAssetItems.univ3daiusdc,
        discoverFiltersAssetItems.stetheth,
      ]),
      size: discoverSizeFilter,
      time: discoverTimeFilter,
    },
    banner: {
      link: '/earn',
      icon: discoverBannerIcons[DiscoverPages.MOST_YIELD_EARNED],
    },
  },
  {
    kind: DiscoverPages.LARGEST_DEBT,
    endpoint: '/mocks/discover/largest-debt.json',
    iconColor: '#FF4DB8',
    iconContent: discoverNavigationIconContent[DiscoverPages.LARGEST_DEBT],
    filters: {
      asset: getAssetOptions([
        discoverFiltersAssetItems.eth,
        discoverFiltersAssetItems.wbtc,
        discoverFiltersAssetItems.uni,
        discoverFiltersAssetItems.link,
        discoverFiltersAssetItems.mana,
        discoverFiltersAssetItems.matic,
        discoverFiltersAssetItems.gusd,
        discoverFiltersAssetItems.curve,
        discoverFiltersAssetItems.yfi,
      ]),
      size: discoverSizeFilter,
    },
    banner: {
      link: '/borrow',
      icon: discoverBannerIcons[DiscoverPages.LARGEST_DEBT],
    },
  },
]
