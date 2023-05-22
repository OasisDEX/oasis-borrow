import BigNumber from 'bignumber.js'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'

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
  strategy?: 'long' | 'short'
  strategyLabel?: string
}

export type OasisCreateItem = OasisCreateItemBasics & OasisCreateItemDetails

export interface OasisCreateFilters {
  network?: OasisCreateItem['network'][]
  primaryToken?: OasisCreateItem['primaryToken'][]
  protocol?: OasisCreateItem['protocol'][]
  secondaryToken?: OasisCreateItem['secondaryToken'][]
  strategy?: OasisCreateItem['strategy'][]
}
