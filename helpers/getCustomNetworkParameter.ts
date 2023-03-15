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

export function useCustomNetworkParameter(): CustomNetwork | undefined {
  const [customNetworkName, setCustomNetworkName] = useState<CustomNetwork | undefined>(undefined)

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
    return setCustomNetworkName(undefined)
  }, [])

  useEffect(() => {
    networkChanged()
  }, [networkChanged])

  return customNetworkName
}
