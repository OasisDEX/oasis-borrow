import { useLocalStorage } from 'helpers/useLocalStorage'

import { NetworkNames } from './network-names'

export type CustomForkParameterFieldsType = 'url' | 'id' | 'isAddedToWallet'
export type CustomForkParameterType = Partial<
  Record<NetworkNames, Record<CustomForkParameterFieldsType, string>>
>

export const CustomForkStorageKey = 'ForkNetwork'

export function useCustomForkParameter() {
  return useLocalStorage<CustomForkParameterType>(
    CustomForkStorageKey,
    {} as CustomForkParameterType,
  )
}
