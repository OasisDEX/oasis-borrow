import { AppContext } from 'components/AppContext'
import { WithChildren } from 'helpers/types'
import React, { useContext, useEffect, useState } from 'react'

export const testAppContext = React.createContext<AppContext | undefined>(undefined)

export function isAppContextAvailable(): boolean {
  return !!useContext(testAppContext)
}

export function useAppContext(): AppContext {
  const ac = useContext(testAppContext)
  if (!ac) {
    throw new Error("test AppContext not available! useAppContext can't be used serverside")
  }
  return ac
}

export function AppContextProvider({ children }: WithChildren) {
  const [uiChanges] = useState<AppContext | undefined>(undefined)
  //   const [context, setContext] = useState<AppContext | undefined>(undefined)

  useEffect(() => {
    // uiChanges
    // publish here or in tests like SidebarAutoTakeProfitEditingStage.test use as below
    // const mockUiChanges = initializeUIChanges().publish()
  }, [])

  return <testAppContext.Provider value={uiChanges}>{children}</testAppContext.Provider>
  //   return <testAppContext.Provider value={context}>{children}</testAppContext.Provider>
}
