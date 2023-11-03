import type { PropsWithChildren, ReactNode } from 'react'
import React, { createContext, useContext, useState } from 'react'

interface SharedUIState {
  vaultFormToggleTitle?: string
  setVaultFormToggleTitle: (title: ReactNode | undefined) => void
  vaultFormOpened: boolean
  setVaultFormOpened: (opened: boolean) => void
}

export const SharedUIContext = createContext<SharedUIState | {}>({})

export const useSharedUI = () => useContext(SharedUIContext) as SharedUIState

export function SharedUIProvider({ children }: PropsWithChildren<{}>) {
  const [vaultFormToggleTitle, setVaultFormToggleTitle] = useState<ReactNode | undefined>(undefined)
  const [vaultFormOpened, setVaultFormOpened] = useState(false)

  return (
    <SharedUIContext.Provider
      value={{
        vaultFormToggleTitle,
        setVaultFormToggleTitle,
        vaultFormOpened,
        setVaultFormOpened,
      }}
    >
      {children}
    </SharedUIContext.Provider>
  )
}
