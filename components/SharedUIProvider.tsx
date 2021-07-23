import { WithChildren } from 'helpers/types'
import React, { createContext, useContext, useState } from 'react'

interface SharedUIState {
  vaultFormToggleTitle?: string
  setVaultFormToggleTitle: (title: string | undefined) => void
  vaultFormOpened: boolean
  setVaultFormOpened: (opened: boolean) => void
}

export const SharedUIContext = createContext<SharedUIState | {}>({})

export const useSharedUI = () => useContext(SharedUIContext) as SharedUIState

export function SharedUIProvider({ children }: WithChildren) {
  const [vaultFormToggleTitle, setVaultFormToggleTitle] = useState<string | undefined>(undefined)
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
