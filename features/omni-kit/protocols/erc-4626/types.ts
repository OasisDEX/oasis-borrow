import type { OmniSupportedNetworkIds, OmniSupportedProtocols } from 'features/omni-kit/types'

export interface Erc4626Token {
  address: string
  precision: number
  symbol: string
}

export interface Erc4626Config {
  address: string
  curator: {
    label: string
    url: string
  }
  id: string
  name: string
  network: OmniSupportedNetworkIds
  protocol: OmniSupportedProtocols
  rewards: {
    label?: string
    token: string
    withPricePicker?: boolean
  }[]
  strategy: string
  token: Erc4626Token
}
