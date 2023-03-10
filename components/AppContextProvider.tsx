import React, { useContext, useEffect, useState } from 'react'

import { WithChildren } from '../helpers/types'
import { AppContext, setupAppContext } from './AppContext'

export const appContext = React.createContext<AppContext | undefined>(undefined)

export function isAppContextAvailable(): boolean {
  return !!useContext(appContext)
}

export function useAppContext(): AppContext {
  const ac = useContext(appContext)
  if (!ac) {
    throw new Error("AppContext not available! useAppContext can't be used serverside")
  }
  return ac
}

/*
  This component is providing streams of data used for rendering whole app (AppContext).
  It depends on web3 - which for now is only provided by Client side.
  To block rendering of given page eg. '/trade' setup conditional rendering
  on top of that page with isAppContextAvailable.
*/

export function AppContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<AppContext | undefined>(undefined)

  useEffect(() => {
    setContext(setupAppContext())
  }, [])

  return <appContext.Provider value={context}>{children}</appContext.Provider>
}
