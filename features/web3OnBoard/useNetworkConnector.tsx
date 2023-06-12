import { NetworkConnector } from '@web3-react/network-connector'
import { NetworkConfig, networkSetById, useCustomNetworkParameter } from 'blockchain/networks'
import { useMemo } from 'react'

export interface NetworkConnectorState {
  networkConnector: NetworkConnector
  networkConfig: NetworkConfig
}
export function useNetworkConnector(): NetworkConnectorState {
  const [customNetwork] = useCustomNetworkParameter()
  const connector = useMemo(() => {
    return new NetworkConnector({
      urls: {
        [customNetwork?.id]: networkSetById[customNetwork?.id].rpcUrl,
      },
      defaultChainId: parseInt(customNetwork?.id as unknown as string),
    })
  }, [customNetwork])

  const config = networkSetById[customNetwork.id]

  return {
    networkConnector: connector,
    networkConfig: config,
  }
}
