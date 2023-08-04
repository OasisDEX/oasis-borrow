import { AppContext, setupAppContext } from 'helpers/context/AppContext'
import { WithChildren } from 'helpers/types'
import React, { useContext as checkContext, useContext, useEffect, useState } from 'react'

import { useAccountContext } from './AccountContextProvider'
import { useMainContext } from './MainContextProvider'

export const appContext = React.createContext<AppContext | undefined>(undefined)

export function isAppContextAvailable(): boolean {
  return !!checkContext(appContext)
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
  const mainContext = useMainContext()
  const accountContext = useAccountContext()

  useEffect(() => {
    setContext(setupAppContext(mainContext, accountContext))
  }, [accountContext, mainContext])

  return <appContext.Provider value={context}>{children}</appContext.Provider>
}
