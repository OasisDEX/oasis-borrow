import { networkSetById } from 'blockchain/networks/network-helpers'
import { NetworkIds } from 'blockchain/networks/network-ids'
import { networksById } from 'blockchain/networks/networks-config'
import { ethers } from 'ethers'

export function getRpcProvider(networkId: NetworkIds): ethers.providers.Provider {
  const provider = networkSetById[networkId]?.getReadProvider()

  if (provider) {
    return provider
  }

  const maybeDisabledProvider = networksById[networkId]?.getReadProvider()

  if (maybeDisabledProvider) {
    return maybeDisabledProvider
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
