import { networksByName } from 'blockchain/config'
import { useCallback, useEffect, useState } from 'react'

export function getCustomNetworkParameter() {
  const customNetworkName = new URLSearchParams(window.location.search).get('network')
  return customNetworkName ? { network: customNetworkName } : undefined
}

type CustomNetwork = {
  network: string
  id: string
  hexId: string
}

export function useCustomNetworkParameter(): CustomNetwork {
  const [customNetworkName, setCustomNetworkName] = useState<CustomNetwork>({
    network: 'mainnet',
    id: '1',
    hexId: '0x1',
  })

  const networkChanged = useCallback(() => {
    const customNetworkName = new URLSearchParams(window.location.search).get('network')
    if (customNetworkName) {
      const network = networksByName[customNetworkName]
      if (network) {
        return setCustomNetworkName({
          network: customNetworkName,
          id: network.id,
          hexId: network.hexId,
        })
      }
    }
  }, [])

  useEffect(() => {
    networkChanged()
  }, [networkChanged])

  return customNetworkName
}
