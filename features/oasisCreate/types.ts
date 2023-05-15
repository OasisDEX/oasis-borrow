import BigNumber from 'bignumber.js'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'

export enum ProductType {
  Borrow = 'borrow',
  Multiply = 'multiply',
  Earn = 'earn',
}

export interface OasisCreateItemBasics {
  groupToken: string
  label: string
  network: BaseNetworkNames | BaseNetworkNames[]
  primaryToken: string
  product: ProductType | ProductType[]
  protocol: LendingProtocol
  secondaryToken: string
  url: string
}

export interface OasisCreateItemDetails {
  '7DayNetApy'?: BigNumber
  '90DayNetApy'?: BigNumber
  fee?: BigNumber
  investmentType?: ('long' | 'short') | ('long' | 'short')[]
  liquidity?: BigNumber
  managementType?: 'active' | 'passive'
  maxLtv?: BigNumber
  maxMultiply?: BigNumber
}

export type OasisCreateItem = OasisCreateItemBasics & OasisCreateItemDetails

export interface OasisCreateFilters {
  groupToken?: string
  secondaryToken?: string[]
  network?: string[]
  protocol?: string[]
}
