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
  primaryTokenGroup?: ProductHubTokenType
  primaryTokenAddress: ProductHubTokenType
  product: ProductHubProductType[]
  protocol: LendingProtocol
  secondaryToken: ProductHubTokenType
  secondaryTokenGroup?: ProductHubTokenType
  secondaryTokenAddress: ProductHubTokenType
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
  network?: ProductHubSupportedNetworks[]
  primaryToken?: ProductHubTokenType[]
  primaryTokenGroup?: ProductHubTokenType[]
  protocol?: LendingProtocol[]
  secondaryToken?: ProductHubTokenType[]
  secondaryTokenGroup?: ProductHubTokenType[]
  multiplyStrategyType?: ProductHubMultiplyStrategyType[]
}

export interface ProductHubFilters {
  or: ProductHubFiltersCriteria[]
  and: ProductHubFiltersCriteria
}

export interface ProductHubQueryString {
  debtToken?: ProductHubTokenType[]
  network?: ProductHubSupportedNetworks[]
  protocol?: LendingProtocol[]
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
