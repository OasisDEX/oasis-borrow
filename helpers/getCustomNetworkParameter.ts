import { networksByName } from 'blockchain/config'

import { useLocalStorage } from './useLocalStorage'

export function getCustomNetworkParameter() {
  const customNetwork = new URLSearchParams(window.location.search).get('network')
  return customNetwork ? { network: customNetwork } : undefined
}

export const mainnetNetworkParameter = {
  network: networksByName['ethereumMainnet'].name!,
  id: networksByName['ethereumMainnet'].id!,
  hexId: networksByName['ethereumMainnet'].hexId!,
}

export const CustomNetworkStorageKey = 'CustomNetwork'

export function useCustomNetworkParameter() {
  return useLocalStorage(CustomNetworkStorageKey, mainnetNetworkParameter)
}
