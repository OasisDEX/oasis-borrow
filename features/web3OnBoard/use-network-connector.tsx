import { useMemo } from 'react'
import { NetworkConnector } from '@web3-react/network-connector'
import { enableNetworksSet, NetworkConfig, NetworkIds } from 'blockchain/networks'
import { useLegacyDefaultChain } from 'features/web3OnBoard/use-legacy-default-chain'

export type NetworkConnectorState = {
  networkConnector: NetworkConnector
  networkConfigs: Partial<{ [key: NetworkIds]: NetworkConfig }>
}

export function useNetworkConnector(): NetworkConnectorState {
  const [defaultChain] = useLegacyDefaultChain()

  return useMemo(() => {
    const networkConfigs: Partial<{ [key: NetworkIds]: NetworkConfig }> = {}
    const urls: { [chainId: number]: string } = {}

    enableNetworksSet.forEach((network) => {
      networkConfigs[network.id] = network
      urls[network.id] = network.rpcUrl
    })

    return {
      networkConnector: new NetworkConnector({
        urls,
        defaultChainId: defaultChain,
      }),
      networkConfigs,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
