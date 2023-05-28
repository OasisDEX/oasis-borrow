import { NetworkConnector } from '@web3-react/network-connector'
import { networksListWithForksById, useCustomNetworkParameter } from 'blockchain/networks'
import { useMemo } from 'react'

export function useNetworkConnector(): NetworkConnector | null {
  const [customNetwork] = useCustomNetworkParameter()
  return useMemo(() => {
    return new NetworkConnector({
      urls: {
        [customNetwork?.id]: networksListWithForksById[customNetwork?.id].rpcUrl,
      },
      defaultChainId: parseInt(customNetwork?.id as unknown as string),
    })
  }, [customNetwork])
}
