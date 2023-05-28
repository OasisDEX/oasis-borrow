import { ethers } from 'ethers'

import { networksListWithForksById } from './network-helpers'
import { NetworkIds } from './network-ids'

export function getRpcProvider(networkId: NetworkIds): ethers.providers.Provider {
  const provider = networksListWithForksById[networkId]?.readProvider

  if (provider) {
    return provider
  }

  console.warn('No provider found for network', networkId)
  return ethers.providers.getDefaultProvider({
    chainId: Number(networkId),
    name: 'EVM Network',
  })
}
