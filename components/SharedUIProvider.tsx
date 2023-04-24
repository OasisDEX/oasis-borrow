import { WithChildren } from 'helpers/types'
import React, { createContext, ReactNode, useContext, useState } from 'react'

interface SharedUIState {
  vaultFormToggleTitle?: string
  setVaultFormToggleTitle: (title: ReactNode | undefined) => void
  vaultFormOpened: boolean
  setVaultFormOpened: (opened: boolean) => void
}

export const SharedUIContext = createContext<SharedUIState | {}>({})

export const useSharedUI = () => useContext(SharedUIContext) as SharedUIState

export function SharedUIProvider({ children }: WithChildren) {
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
