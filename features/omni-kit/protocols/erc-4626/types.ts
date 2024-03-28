import type { OmniSupportedNetworkIds, OmniSupportedProtocols } from 'features/omni-kit/types'

export enum Erc4626RewardsType {
  MetaMorpho = 'MetaMorpho',
}

export interface Erc4626PricePicker {
  marketCap?: number
  prices: number[]
  token: string
}

export interface Erc4626Token {
  address: string
  precision: number
  symbol: string
}

export interface Erc4626Config {
  address: string
  curator: {
    icon?: string
    label: string
    url: string
  }
  id: string
  name: string
  networkId: OmniSupportedNetworkIds
  pricePicker?: Erc4626PricePicker
  protocol: OmniSupportedProtocols
  rewards: {
    label?: string
    token: string
  }[]
  rewardsType?: Erc4626RewardsType
  strategy: string
  token: Erc4626Token
}
