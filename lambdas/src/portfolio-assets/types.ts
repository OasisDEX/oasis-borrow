import { NetworkNames } from 'blockchain/networks'

export enum DebankNetworkNames {
  ethereumMainnet = 'eth',
  arbitrumMainnet = 'arb',
  polygonMainnet = 'matic',
  optimismMainnet = 'op',
  baseMainnet = 'base',
}

export const DebankNetworkNameToOurs = {
  [DebankNetworkNames.ethereumMainnet]: NetworkNames.ethereumMainnet,
  [DebankNetworkNames.arbitrumMainnet]: NetworkNames.arbitrumMainnet,
  [DebankNetworkNames.polygonMainnet]: NetworkNames.polygonMainnet,
  [DebankNetworkNames.optimismMainnet]: NetworkNames.optimismMainnet,
  [DebankNetworkNames.baseMainnet]: NetworkNames.baseMainnet,
}

export type DebankTokenReply = {
  id: string
  chain: string
  name: string
  symbol: string
  display_symbol: string
  optimized_symbol: string
  decimals: number
  logo_url: string
  protocol_id: string
  price: number
  price_24h_change: number
  is_verified: boolean
  is_core: boolean
  is_wallet: boolean
  time_at: number
  amount: number
  raw_amount: number
  raw_amount_hex_str: string
}
export type DebankTokensReply = DebankTokenReply[]

export type PortfolioAssetsToken = {
  name: string
  network: NetworkNames
  symbol: string
  priceUSD: number
  price24hChange: number
  balance: number
  balanceUSD: number
}

export type PortfolioAssetsReply = {
  assets: PortfolioAssetsToken[]
}
