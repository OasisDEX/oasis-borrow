import { NetworkNames } from 'blockchain/networks'

export const isRefinanceSupportedNetwork = (networkName: NetworkNames) => {
  return networkName === NetworkNames.ethereumMainnet
}
