import { ethers } from 'ethers'

import { networkSetById } from './network-helpers'
import { NetworkIds } from './network-ids'

export function getRpcProvider(networkId: NetworkIds): ethers.providers.Provider {
  const provider = networkSetById[networkId]?.getReadProvider()

  if (provider) {
    return provider
  }

  console.warn('No provider found for network', networkId)
  return ethers.providers.getDefaultProvider({
    chainId: Number(networkId),
    name: 'EVM Network',
  })
}

export function ensureRpcProvider(
  provider: ethers.providers.Provider | undefined,
  networkId: NetworkIds,
): asserts provider is ethers.providers.Provider {
  if (!provider) {
    throw new Error(`Provider does not exist for network ${networkId}`)
  }
}

export function getRpcProvidersForLogs(networkId: NetworkIds): {
  mainProvider: ethers.providers.Provider
  forkProvider?: ethers.providers.Provider
} {
  const network = networkSetById[networkId]
  const givenNetworkProvider = network?.getReadProvider()

  const parentNetwork = network.getParentNetwork()
  if (!parentNetwork) {
    ensureRpcProvider(givenNetworkProvider, networkId)
    return { mainProvider: givenNetworkProvider }
  }

  const parentNetworkProvider = parentNetwork?.getReadProvider()
  ensureRpcProvider(parentNetworkProvider, parentNetwork.id)
  return { mainProvider: parentNetworkProvider, forkProvider: givenNetworkProvider }
}
