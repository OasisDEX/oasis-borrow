import { ethers } from 'ethers'

import { forkNetworksByOriginalId } from './forks-config'
import { NetworkIds } from './network-ids'
import { networksById } from './networks-config'

export function getRpcProvider(networkId: NetworkIds): ethers.providers.Provider {
  const forkProvider = forkNetworksByOriginalId[networkId]?.readProvider
  if (forkProvider) {
    return forkProvider
  }
  const mainProvider = networksById[networkId].readProvider
  if (mainProvider) {
    return mainProvider
  }

  console.warn('No provider found for network', networkId)
  return ethers.providers.getDefaultProvider({
    chainId: Number(networkId),
    name: 'EVM Network',
  })
}
