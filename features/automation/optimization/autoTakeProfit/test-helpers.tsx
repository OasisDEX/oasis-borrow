// jest.mock('components/AppContextProvider', () => useAppContext())
import { AppContext, initializeUIChanges } from 'components/AppContext'
import { WithChildren } from 'helpers/types'
import React, { useContext } from 'react'

export const testAppContext = React.createContext<AppContext | undefined>(undefined)

export function isAppContextAvailable(): boolean {
  return !!useContext(testAppContext)
}

export function useAppContext(): AppContext {
  console.log('using mock app context')
  const ac = useContext(testAppContext)
  if (!ac) {
    throw new Error("test apud AppContext not available! useAppContext can't be used serverside")
  }
  return ac
}

export function AppContextProvider({ children }: WithChildren) {
  // const [uiChanges] = useState<AppContext | undefined>(undefined)
  //   const [context, setContext] = useState<AppContext | undefined>(undefined)

  // useEffect(() => {
  //   // uiChanges
  //   // publish here or in tests like SidebarAutoTakeProfitEditingStage.test use as below
  //   // const mockUiChanges = initializeUIChanges().publish()
  // }, [])
  const uiChanges = initializeUIChanges()

  return <testAppContext.Provider value={{ uiChanges }}>{children}</testAppContext.Provider>
  //   return <testAppContext.Provider value={context}>{children}</testAppContext.Provider>
}
