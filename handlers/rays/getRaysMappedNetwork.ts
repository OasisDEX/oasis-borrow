import { NetworkNames } from 'blockchain/networks'

export const getRaysMappedNetwork = (networkName: string) =>
  networkName === NetworkNames.ethereumMainnet
    ? 'mainnet'
    : networkName === NetworkNames.arbitrumMainnet
      ? 'arbitrum:one'
      : networkName
