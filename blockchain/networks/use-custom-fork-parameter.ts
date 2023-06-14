import { useLocalStorage } from 'helpers/useLocalStorage'

import { isSupportedNetwork, NetworkNames } from './network-names'

export type CustomForkParameterFieldsType = 'url' | 'id' | 'isAddedToWallet'
export type CustomForkParameterType = Partial<
  Record<NetworkNames, Record<CustomForkParameterFieldsType, string>>
>

export const CustomForkStorageKey = 'ForkNetwork'

export function isValidCustomForkParameter(
  element?: CustomForkParameterType,
): element is CustomForkParameterType {
  if (!element) {
    return false
  }
  if (typeof element !== 'object') {
    return false
  }
  return Object.entries(element).every(([key, value]) => {
    if (!isSupportedNetwork(key)) {
      return false
    }
    if (typeof value !== 'object') {
      return false
    }
    return value.hasOwnProperty('url') && value.hasOwnProperty('id')
  })
}

export function useCustomForkParameter() {
  return useLocalStorage<CustomForkParameterType>(
    CustomForkStorageKey,
    {} as CustomForkParameterType,
    isValidCustomForkParameter,
  )
}
