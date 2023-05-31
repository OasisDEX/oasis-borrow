import { BaseNetworkNames } from 'blockchain/networks'
import { AssetsTableTooltipProps } from 'components/assetsTable/cellComponents/AssetsTableTooltip'
import { PromoCardProps } from 'components/PromoCard'
import { LendingProtocol } from 'lendingProtocols'

export type ProductHubMultiplyStrategyType = 'long' | 'short'
export type ProductHubManagementType = 'active' | 'active_with_liq_risk' | 'passive'

export enum ProductHubProductType {
  Borrow = 'borrow',
  Multiply = 'multiply',
  Earn = 'earn',
}

export type ProductHubSupportedNetworks =
  | BaseNetworkNames.Ethereum
  | BaseNetworkNames.Arbitrum
  | BaseNetworkNames.Optimism

export interface ProductHubItemBasics {
  label: string
  network: ProductHubSupportedNetworks
  primaryToken: string
  primaryTokenGroup?: string
  product: ProductHubProductType[]
  protocol: LendingProtocol
  secondaryToken: string
  secondaryTokenGroup?: string
}

export interface ProductHubItemDetails {
  weeklyNetApy?: string
  depositToken?: string
  earnStrategy?: string
  fee?: string
  liquidity?: string
  managementType?: ProductHubManagementType
  maxLtv?: string
  maxMultiply?: string
  multiplyStrategy?: string
  multiplyStrategyType?: ProductHubMultiplyStrategyType
  reverseTokens?: boolean
  with50Tokens?: string
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

export type ProductHubPromoCards = {
  [key in ProductHubProductType]: {
    default: PromoCardProps[]
    tokens: {
      [key: string]: PromoCardProps[]
    }
  }
}

export interface ProductHubData {
  promoCards: ProductHubPromoCards
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
