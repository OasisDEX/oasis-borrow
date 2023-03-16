import { NetworkConnector } from '@web3-react/network-connector'
import { networksById } from 'blockchain/config'
import { getNetworkId } from 'features/web3Context'
import { useMemo } from 'react'

export function useNetworkConnector() {
  const networkId = getNetworkId()
  return useMemo(() => {
    return new NetworkConnector({
      urls: { [networkId]: networksById[networkId].infuraUrl },
      defaultChainId: networkId,
    })
  }, [networkId])
}
