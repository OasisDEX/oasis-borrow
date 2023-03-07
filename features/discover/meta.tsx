import {
  discoverFiltersAssetItems,
  discoverMultipleFilter,
  discoverSizeFilter,
  discoverTimeFilter,
  getAssetOptions,
} from 'features/discover/filters'
import { discoverBannerIcons, discoverNavigationIconContent } from 'features/discover/icons'
import { DiscoverFilterType, DiscoverPages } from 'features/discover/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'

export interface DiscoverFiltersListOptions {
  label: string
  value: string
  icon?: string
}
export interface DiscoverFiltersListItem {
  label: string
  type: DiscoverFilterType
  options: DiscoverFiltersListOptions[]
}
export interface DiscoverFiltersList {
  [key: string]: DiscoverFiltersListItem
}
export interface DiscoverFollow {
  followerAddress: string
  chainId: number
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
    endpoint: '/api/discover/',
    iconColor: '#FE665C',
    iconContent: discoverNavigationIconContent[DiscoverPages.HIGHEST_RISK_POSITIONS],
    filters: {
      asset: getAssetOptions([
        discoverFiltersAssetItems.eth,
        discoverFiltersAssetItems.wbtc,
        discoverFiltersAssetItems.mana,
        discoverFiltersAssetItems.link,
        discoverFiltersAssetItems.yfi,
        discoverFiltersAssetItems.matic,
        discoverFiltersAssetItems.wsteth,
        discoverFiltersAssetItems.crvv1ethsteth,
      ]),
      size: discoverSizeFilter,
    },
    banner: {
      link: INTERNAL_LINKS.multiply,
      icon: discoverBannerIcons[DiscoverPages.HIGHEST_RISK_POSITIONS],
    },
  },
  {
    kind: DiscoverPages.HIGHEST_MULTIPLY_PNL,
    endpoint: '/api/discover/',
    iconColor: '#FFC700',
    iconContent: discoverNavigationIconContent[DiscoverPages.HIGHEST_MULTIPLY_PNL],
    filters: {
      asset: getAssetOptions([
        discoverFiltersAssetItems.eth,
        discoverFiltersAssetItems.wbtc,
        discoverFiltersAssetItems.mana,
        discoverFiltersAssetItems.link,
        discoverFiltersAssetItems.yfi,
        discoverFiltersAssetItems.matic,
        discoverFiltersAssetItems.wsteth,
      ]),
      multiple: discoverMultipleFilter,
      size: discoverSizeFilter,
      time: discoverTimeFilter,
    },
    banner: {
      link: INTERNAL_LINKS.multiply,
      icon: discoverBannerIcons[DiscoverPages.HIGHEST_MULTIPLY_PNL],
    },
  },
  {
    kind: DiscoverPages.MOST_YIELD_EARNED,
    endpoint: '/api/discover/',
    iconColor: '#00E2BA',
    iconContent: discoverNavigationIconContent[DiscoverPages.MOST_YIELD_EARNED],
    filters: {
      asset: getAssetOptions(
        [discoverFiltersAssetItems.guniv3daiusdc1, discoverFiltersAssetItems.guniv3daiusdc2],
        DiscoverFilterType.HIDDEN,
      ),
      size: discoverSizeFilter,
      time: discoverTimeFilter,
    },
    banner: {
      link: INTERNAL_LINKS.earn,
      icon: discoverBannerIcons[DiscoverPages.MOST_YIELD_EARNED],
    },
  },
  {
    kind: DiscoverPages.LARGEST_DEBT,
    endpoint: '/api/discover/',
    iconColor: '#FF4DB8',
    iconContent: discoverNavigationIconContent[DiscoverPages.LARGEST_DEBT],
    filters: {
      asset: getAssetOptions([
        discoverFiltersAssetItems.eth,
        discoverFiltersAssetItems.wbtc,
        discoverFiltersAssetItems.mana,
        discoverFiltersAssetItems.link,
        discoverFiltersAssetItems.yfi,
        discoverFiltersAssetItems.matic,
        discoverFiltersAssetItems.wsteth,
        discoverFiltersAssetItems.crvv1ethsteth,
      ]),
      size: discoverSizeFilter,
    },
    banner: {
      link: INTERNAL_LINKS.borrow,
      icon: discoverBannerIcons[DiscoverPages.LARGEST_DEBT],
    },
  },
]
