import { NetworkConnector } from '@web3-react/network-connector'
import { networksById } from 'blockchain/config'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useMemo } from 'react'

export function useNetworkConnector(): NetworkConnector {
  const [network] = useCustomNetworkParameter()
  return useMemo(() => {
    return new NetworkConnector({
      urls: { [network?.id]: networksById[network?.id].infuraUrl },
      defaultChainId: parseInt(network?.id),
    })
  }, [network])
}
