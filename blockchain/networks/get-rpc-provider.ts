import type { JsonRpcBatchProvider } from 'blockchain/jsonRpcBatchProvider'
import { providerFactory } from 'blockchain/jsonRpcBatchProvider'
import type { ethers } from 'ethers'
import getConfig from 'next/config'
import { getRpcNodeGateway } from 'pages/api/rpcGateway'

import { networkSetById } from './network-helpers'
import type { NetworkIds } from './network-ids'
import { networksById } from './networks-config'

export function getRpcProvider(networkId: NetworkIds): ethers.providers.Provider {
  const network = networkSetById[networkId] ?? networksById[networkId] // check if maybe we should use disabled provider.

  if (!network) {
    throw new Error(`Network with id ${networkId} does not exist`)
  }

  if (typeof window === 'undefined') {
    return getBackendRpcProvider(networkId)
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

/**
 * Retrieves the backend RPC provider for the specified network.
 * @param networkId The ID of the network.
 * @returns The JSON-RPC batch provider for the network.
 * @throws Error if the network does not exist, RPC Gateway URL is not defined, or RPC provider is not available.
 */
export function getBackendRpcProvider(networkId: NetworkIds): JsonRpcBatchProvider {
  const network = networkSetById[networkId] ?? networksById[networkId] // check if maybe we should use disabled provider.

  if (!network) {
    throw new Error(`Network with id ${networkId} does not exist`)
  }

  const rpcGatewayUrl = getConfig()?.publicRuntimeConfig.rpcGatewayUrl ?? process.env.RPC_GATEWAY
  if (!rpcGatewayUrl) {
    throw new Error('RPC Gateway URL is not defined')
  }
  const rpcBase = `${rpcGatewayUrl}`

  const rpcConfig = {
    skipCache: false,
    skipMulticall: false,
    skipGraph: true,
    stage: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    source: 'backend',
  }

  const node = getRpcNodeGateway(network.name, rpcConfig, rpcBase)

  if (!node) {
    throw new Error('RPC provider is not available')
  }
  return providerFactory.getProvider(node, {
    chainId: networkId,
    name: network.name,
  })
}
