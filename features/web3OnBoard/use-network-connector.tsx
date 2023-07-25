import { NetworkConnector } from '@web3-react/network-connector'
import { enableNetworksSet, NetworkConfig, NetworkIds } from 'blockchain/networks'
import { useMemo } from 'react'

export type NetworkConnectorState = {
  networkConnector: NetworkConnector
  networkConfigs: Partial<Record<NetworkIds, NetworkConfig>>
}

export function useNetworkConnector(): NetworkConnectorState {
  return useMemo(() => {
    const networkConfigs: Partial<Record<NetworkIds, NetworkConfig>> = {}
    const urls: { [chainId: number]: string } = {}
    enableNetworksSet.forEach((network) => {
      networkConfigs[network.id] = network
      urls[network.id] = network.rpcUrl
    })
    return {
      networkConnector: new NetworkConnector({
        urls,
        defaultChainId: 1,
      }),
      networkConfigs,
    }
  }, [])
}
