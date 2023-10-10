import type { AssetsTableBannerProps } from 'components/assetsTable/types'
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
export interface DiscoverPageMeta {
  kind: DiscoverPages
  endpoint: string
  iconColor: string
  iconContent: JSX.Element
  filters: DiscoverFiltersList
  banner: AssetsTableBannerProps
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
      cta: `discover.table.banner.${DiscoverPages.HIGHEST_RISK_POSITIONS}.cta`,
      description: `discover.table.banner.${DiscoverPages.HIGHEST_RISK_POSITIONS}.description`,
      icon: discoverBannerIcons[DiscoverPages.HIGHEST_RISK_POSITIONS],
      link: INTERNAL_LINKS.multiply,
      title: `discover.table.banner.${DiscoverPages.HIGHEST_RISK_POSITIONS}.title`,
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
      cta: `discover.table.banner.${DiscoverPages.HIGHEST_MULTIPLY_PNL}.cta`,
      description: `discover.table.banner.${DiscoverPages.HIGHEST_MULTIPLY_PNL}.description`,
      link: INTERNAL_LINKS.multiply,
      icon: discoverBannerIcons[DiscoverPages.HIGHEST_MULTIPLY_PNL],
      title: `discover.table.banner.${DiscoverPages.HIGHEST_MULTIPLY_PNL}.title`,
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
      cta: `discover.table.banner.${DiscoverPages.MOST_YIELD_EARNED}.cta`,
      description: `discover.table.banner.${DiscoverPages.MOST_YIELD_EARNED}.description`,
      link: INTERNAL_LINKS.earn,
      icon: discoverBannerIcons[DiscoverPages.MOST_YIELD_EARNED],
      title: `discover.table.banner.${DiscoverPages.MOST_YIELD_EARNED}.title`,
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
      cta: `discover.table.banner.${DiscoverPages.LARGEST_DEBT}.cta`,
      description: `discover.table.banner.${DiscoverPages.LARGEST_DEBT}.description`,
      link: INTERNAL_LINKS.borrow,
      icon: discoverBannerIcons[DiscoverPages.LARGEST_DEBT],
      title: `discover.table.banner.${DiscoverPages.LARGEST_DEBT}.title`,
    },
  },
]
