import { networksByName } from 'blockchain/config'
import { Dispatch, SetStateAction } from 'react'

import { useLocalStorage } from './useLocalStorage'

export function getCustomNetworkParameter() {
  const customNetwork = new URLSearchParams(window.location.search).get('network')
  return customNetwork ? { network: customNetwork } : undefined
}

type CustomNetwork = {
  network: string
  id: string
  hexId: string
}

export const mainnetNetworkParameter = {
  network: networksByName['ethereumMainnet'].name,
  id: networksByName['ethereumMainnet'].id,
  hexId: networksByName['ethereumMainnet'].hexId,
}

export const CustomNetworkStorageKey = 'CustomNetwork'

export function useCustomNetworkParameter(): [
  CustomNetwork | undefined,
  Dispatch<SetStateAction<CustomNetwork | undefined>>,
] {
  const [customNetwork, setCustomNetwork] = useLocalStorage(
    CustomNetworkStorageKey,
    mainnetNetworkParameter,
  )

  return [
    customNetwork as CustomNetwork | undefined,
    setCustomNetwork as Dispatch<SetStateAction<CustomNetwork | undefined>>,
  ]
}
