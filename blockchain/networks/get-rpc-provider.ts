import { ethers } from 'ethers'
import { getRpcNode } from 'helpers/getRpcNode'

import { networkSetById } from './network-helpers'
import type { NetworkIds } from './network-ids'
import { networksById } from './networks-config'

export function getRpcProvider(networkId: NetworkIds): ethers.providers.Provider {
  const network = networkSetById[networkId] ?? networksById[networkId] // check if maybe we should use disabled provider.

  if (!network) {
    throw new Error(`Network with id ${networkId} does not exist`)
  }

  // check if server
  if (typeof window === 'undefined') {
    const node = getRpcNode(network.name)
    if (!node) {
      throw new Error('RPC provider is not available')
    }
    return new ethers.providers.JsonRpcProvider(node, {
      chainId: networkId,
      name: network.name,
    })
  }
  const provider = network.getReadProvider()

  if (provider) {
    return provider
  }

  throw new Error(
    `Currently given network id: ${networkId} is not supported by our app. Please contact our developers or add custom fork to enable that network id`,
  )
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
