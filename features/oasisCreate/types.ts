import BigNumber from 'bignumber.js'
import { PromoCardProps } from 'components/PromoCard'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'
import { ReactChild } from 'react'

export type OasisCreateMultiplyStrategyType = 'long' | 'short'
export type OasisCreateManagementType = 'active' | 'active-with-liq-risk' | 'passive'

export enum ProductType {
  Borrow = 'borrow',
  Multiply = 'multiply',
  Earn = 'earn',
}

export interface OasisCreateItemBasics {
  label: string
  network: BaseNetworkNames
  primaryToken: string
  primaryTokenGroup?: string
  product: ProductType | ProductType[]
  protocol: LendingProtocol
  secondaryToken: string
  secondaryTokenGroup?: string
}

export interface OasisCreateItemDetails {
  '7DayNetApy'?: BigNumber
  depositToken?: string
  earnStrategy?: string
  fee?: BigNumber
  liquidity?: BigNumber
  managementType?: OasisCreateManagementType
  maxLtv?: BigNumber
  maxMultiply?: BigNumber
  multiplyStrategy?: string
  multiplyStrategyType?: OasisCreateMultiplyStrategyType
  reverseTokens?: boolean
  with50Tokens?: string
}

export interface OasisCreateItemTooltips {
  tooltips?: {
    [key in keyof Omit<OasisCreateItemDetails, 'depositToken' | 'multiplyStrategyType'>]?: {
      icon: string
      content: ReactChild
    }
  }
}

export type OasisCreateItem = OasisCreateItemBasics &
  OasisCreateItemDetails &
  OasisCreateItemTooltips

export type OasisCreatePromoCards = {
  [key in ProductType]: {
    default: PromoCardProps[]
    tokens: {
      [key: string]: PromoCardProps[]
    }
  }
}

export interface OasisCreateData {
  promoCards: OasisCreatePromoCards
  table: OasisCreateItem[]
}

export interface OasisCreateFiltersCriteria {
  network?: OasisCreateItem['network'][]
  primaryToken?: OasisCreateItem['primaryToken'][]
  primaryTokenGroup?: OasisCreateItem['primaryTokenGroup'][]
  protocol?: OasisCreateItem['protocol'][]
  secondaryToken?: OasisCreateItem['secondaryToken'][]
  secondaryTokenGroup?: OasisCreateItem['secondaryTokenGroup'][]
  multiplyStrategyType?: OasisCreateItem['multiplyStrategyType'][]
}

export interface OasisCreateFilters {
  or: OasisCreateFiltersCriteria[]
  and: OasisCreateFiltersCriteria
}
