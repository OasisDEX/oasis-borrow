import { NetworkConnector } from '@web3-react/network-connector'
import { NetworkConfig, networkSetById, useCustomNetworkParameter } from 'blockchain/networks'
import { useMemo } from 'react'

export interface NetworkConnectorState {
  networkConnector: NetworkConnector
  networkConfig: NetworkConfig
}
export function useNetworkConnector(): NetworkConnectorState {
  const [customNetwork] = useCustomNetworkParameter()
  const [connector, config] = useMemo(() => {
    const network = customNetwork ? networkSetById[customNetwork.id] : networkSetById[1]
    return [
      new NetworkConnector({
        urls: {
          [network.id]: network.rpcUrl,
        },
        defaultChainId: parseInt(customNetwork?.id as unknown as string),
      }),
      network,
    ]
  }, [customNetwork])

  return {
    networkConnector: connector,
    networkConfig: config,
  }
}
