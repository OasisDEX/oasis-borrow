import { NetworkNames } from './network-names'

// based on https://docs.cloud.debank.com/en/readme/api-pro-reference/chain#returns-1
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

export const OursNameToDebankNetworkName = {
  [NetworkNames.ethereumMainnet]: DebankNetworkNames.ethereumMainnet,
  [NetworkNames.arbitrumMainnet]: DebankNetworkNames.arbitrumMainnet,
  [NetworkNames.polygonMainnet]: DebankNetworkNames.polygonMainnet,
  [NetworkNames.optimismMainnet]: DebankNetworkNames.optimismMainnet,
  [NetworkNames.baseMainnet]: DebankNetworkNames.baseMainnet,
}
