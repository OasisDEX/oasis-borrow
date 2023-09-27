import type { NetworkNames } from 'blockchain/networks'
import type { AssetsTableTooltipProps } from 'components/assetsTable/cellComponents/AssetsTableTooltip.types'
import type { PromoCardProps } from 'components/PromoCard.types'
import type { LendingProtocol } from 'lendingProtocols'

import type { EarnStrategies } from '.prisma/client'

export type ProductHubMultiplyStrategyType = 'long' | 'short'
export type ProductHubManagementType = 'active' | 'passive'

export enum ProductHubProductType {
  Borrow = 'borrow',
  Multiply = 'multiply',
  Earn = 'earn',
}

export type ProductHubSupportedNetworks =
  | NetworkNames.ethereumMainnet
  | NetworkNames.ethereumGoerli
  | NetworkNames.arbitrumMainnet
  | NetworkNames.arbitrumGoerli
  | NetworkNames.optimismMainnet
  | NetworkNames.optimismGoerli

export interface ProductHubItemBasics {
  label: string
  network: ProductHubSupportedNetworks
  primaryToken: string
  primaryTokenGroup?: string
  primaryTokenAddress: string
  product: ProductHubProductType[]
  protocol: LendingProtocol
  secondaryToken: string
  secondaryTokenGroup?: string
  secondaryTokenAddress: string
}

export interface ProductHubItemDetails {
  weeklyNetApy?: string
  depositToken?: string
  earnStrategy?: EarnStrategies
  earnStrategyDescription?: string
  fee?: string
  liquidity?: string
  managementType?: ProductHubManagementType
  maxLtv?: string
  maxMultiply?: string
  multiplyStrategy?: string
  multiplyStrategyType?: ProductHubMultiplyStrategyType
  reverseTokens?: boolean
  hasRewards?: boolean
}

export interface ProductHubItemTooltips {
  tooltips?: {
    [key in keyof Omit<
      ProductHubItemDetails,
      'depositToken' | 'multiplyStrategyType'
    >]?: AssetsTableTooltipProps
  }
}

export type ProductHubItem = ProductHubItemBasics & ProductHubItemDetails & ProductHubItemTooltips
export type ProductHubItemWithoutAddress = Omit<
  ProductHubItem,
  'primaryTokenAddress' | 'secondaryTokenAddress'
>

export type ProductHubItemWithFlattenTooltip = Omit<ProductHubItem, 'tooltips'> & {
  tooltips: string
}

export type ProductHubPromoCards = {
  [key in ProductHubProductType]: {
    default: PromoCardProps[]
    tokens: {
      [key: string]: PromoCardProps[]
    }
  }
}

export interface ProductHubData {
  table: ProductHubItem[]
}

export interface ProductHubFiltersCriteria {
  network?: ProductHubItem['network'][]
  primaryToken?: ProductHubItem['primaryToken'][]
  primaryTokenGroup?: ProductHubItem['primaryTokenGroup'][]
  protocol?: ProductHubItem['protocol'][]
  secondaryToken?: ProductHubItem['secondaryToken'][]
  secondaryTokenGroup?: ProductHubItem['secondaryTokenGroup'][]
  multiplyStrategyType?: ProductHubItem['multiplyStrategyType'][]
}

export interface ProductHubFilters {
  or: ProductHubFiltersCriteria[]
  and: ProductHubFiltersCriteria
}
