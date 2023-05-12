import { NetworkConfig, networksByName } from 'blockchain/networksConfig'
import { Dispatch, SetStateAction } from 'react'

import { isSupportedNetwork, NetworkNames } from './networkNames'
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

type CustomNetworkParameterType = Pick<NetworkConfig, 'id' | 'hexId'> & { network: NetworkNames }

export const mainnetNetworkParameter: CustomNetworkParameterType = {
  network: networksByName[NetworkNames.ethereumMainnet].name,
  id: networksByName[NetworkNames.ethereumMainnet].id,
  hexId: networksByName[NetworkNames.ethereumMainnet].hexId,
}

export const CustomNetworkStorageKey = 'CustomNetwork'
export const CustomHardhatStorageKey = 'HardhatNetwork'

function isValidCustomNetworkParameter(
  element?: CustomNetworkParameterType,
): element is CustomNetworkParameterType {
  if (!element) {
    return false
  }
  return !!isSupportedNetwork(element.network)
}

export function useCustomNetworkParameter(): [
  CustomNetworkParameterType,
  Dispatch<SetStateAction<CustomNetworkParameterType | null>>,
] {
  const [state, setState] = useLocalStorage(
    CustomNetworkStorageKey,
    mainnetNetworkParameter,
    isValidCustomNetworkParameter,
  )

  return [state, setState]
}

export function useCustomHardhatParameter() {
  return useLocalStorage<CustomHardhatParameterType>(
    CustomHardhatStorageKey,
    {} as CustomHardhatParameterType,
  )
}
