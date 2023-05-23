import BigNumber from 'bignumber.js'
import { BaseNetworkNames } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'

export type OasisCreateProductStrategy = 'long' | 'short'

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
  '90DayNetApy'?: BigNumber
  fee?: BigNumber
  liquidity?: BigNumber
  managementType?: 'active' | 'passive'
  maxLtv?: BigNumber
  maxMultiply?: BigNumber
  strategy?: OasisCreateProductStrategy
  strategyLabel?: string
}

export type OasisCreateItem = OasisCreateItemBasics & OasisCreateItemDetails

export interface OasisCreateFiltersCriteria {
  network?: OasisCreateItem['network'][]
  primaryToken?: OasisCreateItem['primaryToken'][]
  primaryTokenGroup?: OasisCreateItem['primaryTokenGroup'][]
  protocol?: OasisCreateItem['protocol'][]
  secondaryToken?: OasisCreateItem['secondaryToken'][]
  secondaryTokenGroup?: OasisCreateItem['secondaryTokenGroup'][]
  strategy?: OasisCreateItem['strategy'][]
}

export interface OasisCreateFilters {
  or: OasisCreateFiltersCriteria[]
  and: OasisCreateFiltersCriteria
}
