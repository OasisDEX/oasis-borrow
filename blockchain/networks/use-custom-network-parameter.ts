import { useLocalStorage } from 'helpers/useLocalStorage'
import { Dispatch, SetStateAction } from 'react'

import { isSupportedNetwork, NetworkNames } from './network-names'
import { NetworkConfig, networksByName } from './networks-config'

type CustomNetworkParameterType = Pick<NetworkConfig, 'id' | 'hexId'> & { network: NetworkNames }
export const mainnetNetworkParameter: CustomNetworkParameterType = {
  network: networksByName[NetworkNames.ethereumMainnet].name,
  id: networksByName[NetworkNames.ethereumMainnet].id,
  hexId: networksByName[NetworkNames.ethereumMainnet].hexId,
}
export const CustomNetworkStorageKey = 'CustomNetwork'

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
