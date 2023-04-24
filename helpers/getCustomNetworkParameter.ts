import { networksByName } from 'blockchain/networksConfig'

import { NetworkNames } from './networkNames'
import { useLocalStorage } from './useLocalStorage'

export function getCustomNetworkParameter() {
  const customNetwork = new URLSearchParams(window.location.search).get('network')
  return customNetwork ? { network: customNetwork } : undefined
}

export const mainnetNetworkParameter = {
  network: networksByName[NetworkNames.ethereumMainnet].name!,
  id: networksByName[NetworkNames.ethereumMainnet].id!,
  hexId: networksByName[NetworkNames.ethereumMainnet].hexId!,
}

export const CustomNetworkStorageKey = 'CustomNetwork'

export function useCustomNetworkParameter() {
  return useLocalStorage(CustomNetworkStorageKey, mainnetNetworkParameter)
}
