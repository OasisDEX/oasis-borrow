import { NetworkConnector } from '@web3-react/network-connector'
import { networksById } from 'blockchain/networksConfig'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useMemo } from 'react'

export function useNetworkConnector(): NetworkConnector | null {
  const [customNetwork] = useCustomNetworkParameter()
  return useMemo(() => {
    return new NetworkConnector({
      urls: { [customNetwork?.id]: networksById[customNetwork?.id].rpcCallsEndpoint },
      defaultChainId: parseInt(customNetwork?.id),
    })
  }, [customNetwork])
}
