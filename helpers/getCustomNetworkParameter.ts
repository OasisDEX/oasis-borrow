import { networksByName } from 'blockchain/networksConfig'

import { NetworkNames } from './networkNames'
import { useLocalStorage } from './useLocalStorage'

export type CustomHardhatParameterFieldsType = 'url' | 'id'
export type CustomHardhatParameterType = Record<
  NetworkNames,
  Record<CustomHardhatParameterFieldsType, string>
>

export function getCustomNetworkParameter() {
  const customNetwork = new URLSearchParams(window.location.search).get('network')
  return customNetwork ? { network: customNetwork } : undefined
}

export const mainnetNetworkParameter = {
  network: networksByName[NetworkNames.ethereumMainnet].name,
  id: networksByName[NetworkNames.ethereumMainnet].id,
  hexId: networksByName[NetworkNames.ethereumMainnet].hexId,
}

export const CustomNetworkStorageKey = 'CustomNetwork'
export const CustomHardhatStorageKey = 'HardhatNetwork'

export function useCustomNetworkParameter() {
  return useLocalStorage(CustomNetworkStorageKey, mainnetNetworkParameter)
}

export function useCustomHardhatParameter() {
  return useLocalStorage<CustomHardhatParameterType>(
    CustomHardhatStorageKey,
    {} as CustomHardhatParameterType,
  )
}
