import { NetworkConnector } from '@web3-react/network-connector'
import { networksById } from 'blockchain/config'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useMemo } from 'react'

export function useNetworkConnector(): NetworkConnector {
  const [customNetwork] = useCustomNetworkParameter()
  return useMemo(() => {
    return new NetworkConnector({
      urls: { [customNetwork?.id]: networksById[customNetwork?.id].infuraUrl },
      defaultChainId: parseInt(customNetwork?.id),
    })
  }, [customNetwork])
}
