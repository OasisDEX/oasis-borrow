import React, { useContext } from 'react'

import { OpenGuniVaultState } from '../features/openGuniVault/openGuniVault'
import { WithChildren } from '../helpers/types'

export const guniStateContext = React.createContext<OpenGuniVaultState | undefined>(undefined)

export function isGuniContextAvailable(): boolean {
  return !!useContext(guniStateContext)
}

export function useGuniState<T>(selector: (state: OpenGuniVaultState) => T) {
  const ac = useContext(guniStateContext)
  if (!ac) {
    throw new Error('GuniStateContext not available!')
  }
  return selector(ac)
}

export function GuniStateContextProvider({
  value,
  children,
}: { value: OpenGuniVaultState } & WithChildren) {
  return <guniStateContext.Provider value={value}>{children}</guniStateContext.Provider>
}
