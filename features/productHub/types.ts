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

export type ProductHubTokenType = string
export type ProductHubRewardsType = boolean

export type ProductHubSupportedNetworks =
  | NetworkNames.ethereumMainnet
  | NetworkNames.ethereumGoerli
  | NetworkNames.arbitrumMainnet
  | NetworkNames.arbitrumGoerli
  | NetworkNames.optimismMainnet
  | NetworkNames.optimismGoerli
  | NetworkNames.baseMainnet
  | NetworkNames.baseGoerli

export type ProductHubColumnKey =
  | '7DayNetApy'
  | 'action'
  | 'borrowRate'
  | 'collateralDebt'
  | 'depositToken'
  | 'liquidity'
  | 'management'
  | 'maxLtv'
  | 'maxMultiple'
  | 'protocolNetwork'
  | 'strategy'

export interface ProductHubItemBasics {
  label: string
  network: ProductHubSupportedNetworks
  primaryToken: ProductHubTokenType
  primaryTokenAddress: ProductHubTokenType
  primaryTokenGroup?: ProductHubTokenType
  product: ProductHubProductType[]
  protocol: LendingProtocol
  secondaryToken: ProductHubTokenType
  secondaryTokenAddress: ProductHubTokenType
  secondaryTokenGroup?: ProductHubTokenType
}

export interface ProductHubItemDetails {
  depositToken?: string
  earnStrategy?: EarnStrategies
  earnStrategyDescription?: string
  fee?: string
  hasRewards?: boolean
  liquidity?: string
  managementType?: ProductHubManagementType
  maxLtv?: string
  maxMultiply?: string
  multiplyStrategy?: string
  multiplyStrategyType?: ProductHubMultiplyStrategyType
  reverseTokens?: boolean
  weeklyNetApy?: string
}

export interface ProductHubItemTooltips {
  tooltips?: {
    [key in
      | keyof Omit<ProductHubItemDetails, 'depositToken' | 'multiplyStrategyType'>
      | 'asset']?: AssetsTableTooltipProps
  }
}

export type ProductHubItemData = ProductHubItemBasics & ProductHubItemDetails
export type ProductHubItem = ProductHubItemData & ProductHubItemTooltips
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
export interface ProductHubFilters {
  [key: string]: string[]
}

export interface ProductHubQueryString {
  debtToken?: ProductHubTokenType[]
  network?: ProductHubSupportedNetworks[]
  protocol?: LendingProtocol[]
  rewardsOnly?: ProductHubRewardsType[]
  secondaryToken?: ProductHubTokenType[]
  strategy?: ProductHubMultiplyStrategyType[]
}

export interface ProductFinderPromoCardFilters {
  network: ProductHubSupportedNetworks
  primaryToken: string
  product: ProductHubProductType
  protocol: LendingProtocol
  secondaryToken: ProductHubTokenType
}
