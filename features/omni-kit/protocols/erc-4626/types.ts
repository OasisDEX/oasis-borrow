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
  networkId: OmniSupportedNetworkIds
  protocol: OmniSupportedProtocols
  token: Erc4626Token
}
