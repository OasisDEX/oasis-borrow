import { useLocalStorage } from 'helpers/useLocalStorage'
import { Dispatch, SetStateAction } from 'react'

import { enableNetworksSet } from './network-helpers'
import { NetworkNames } from './network-names'
import { NetworkConfig, networksByName } from './networks-config'

type CustomNetworkParameterType = Pick<NetworkConfig, 'id' | 'hexId'> & { network: NetworkNames }
export const mainnetNetworkParameter: CustomNetworkParameterType = {
  network: networksByName[NetworkNames.ethereumMainnet].name,
  id: networksByName[NetworkNames.ethereumMainnet].id,
  hexId: networksByName[NetworkNames.ethereumMainnet].hexId,
}
export const CustomNetworkStorageKey = 'CustomNetwork'

function isValidCustomNetworkParameter(
  element?: CustomNetworkParameterType | null,
): element is CustomNetworkParameterType {
  if (!element) {
    return false
  }
  return enableNetworksSet.some((network) => network.name === element.network)
}

export function useCustomNetworkParameter(): [
  CustomNetworkParameterType | null,
  Dispatch<SetStateAction<CustomNetworkParameterType | null>>,
] {
  const [state, setState] = useLocalStorage<CustomNetworkParameterType | null>(
    CustomNetworkStorageKey,
    null,
    isValidCustomNetworkParameter,
  )

  return [state, setState]
}
