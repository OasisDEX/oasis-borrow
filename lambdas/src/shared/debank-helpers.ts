import { NetworkNames } from './domain-types'

export const SUPPORTED_CHAIN_IDS = ['eth', 'op', 'arb', 'base']
export const SUPPORTED_PROTOCOL_IDS = ['aave2', 'aave3', 'ajna', 'makerdao', 'spark']
export const SUPPORTED_PROXY_IDS = ['summer']

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
