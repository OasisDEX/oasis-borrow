import type { AutomationFeature } from '@prisma/client'
import type { NetworkNames } from 'blockchain/networks'
import type { AssetsTableTooltipProps } from 'components/assetsTable/cellComponents/AssetsTableTooltip.types'
import type { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

import type { EarnStrategies } from '.prisma/client'

export type ProductHubMultiplyStrategyType = 'long' | 'short'
export type ProductHubManagementType = 'active' | 'passive'

export type ProductHubSupportedNetworks =
  | NetworkNames.ethereumMainnet
  | NetworkNames.ethereumGoerli
  | NetworkNames.arbitrumMainnet
  | NetworkNames.arbitrumGoerli
  | NetworkNames.optimismMainnet
  | NetworkNames.optimismGoerli
  | NetworkNames.baseMainnet
  | NetworkNames.baseGoerli

export enum ProductHubCategory {
  All = 'all',
  Restaking = 'restaking',
  StakingRewards = 'staking-rewards',
  TokenFarming = 'token-farming',
  YieldLoops = 'yield-loops',
}

export enum ProductHubTag {
  BluechipAssets = 'bluechip-assets',
  EasiestToManage = 'easiest-to-manage',
  EthDerivativeYieldLoops = 'eth-derivative-yield-loops',
  Gt1BTvl = 'gt-1b-tvl',
  IsolatedPairs = 'isolated-pairs',
  Longevity = 'longevity',
  Memecoins = 'memecoins',
  MoreCapitalEfficient = 'more-capital-efficient',
  NonStablecoinCollateral = 'non-stablecoin-collateral',
  Stablecoins = 'stablecoins',
}

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
  primaryToken: string
  primaryTokenAddress: string
  primaryTokenGroup?: string
  product: OmniProductType[]
  protocol: LendingProtocol
  secondaryToken: string
  secondaryTokenAddress: string
  secondaryTokenGroup?: string
}

export interface ProductHubItemDetails {
  automationFeatures?: AutomationFeature[]
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

export interface ProductHubData {
  table: ProductHubItem[]
}
export interface ProductHubFilters {
  [key: string]: string[]
}

export type ProductHubCategories = {
  [key in OmniProductType]: {
    icon: string
    id: ProductHubCategory
  }[]
}

export type ProductHubTags = {
  [key in OmniProductType]: ProductHubTag[]
}

export interface ProductHubFeaturedFilters {
  label?: string
  network: ProductHubSupportedNetworks
  primaryToken: string
  product: OmniProductType
  protocol: LendingProtocol
  secondaryToken: string
}

export type ProductHubFeaturedProducts = {
  [key in OmniProductType]?: ProductHubFeaturedFilters[]
}
