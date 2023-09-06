import { MainContext, setupMainContext } from 'helpers/context/MainContext'
import { WithChildren } from 'helpers/types'
import React, { useContext as checkContext, useContext, useEffect, useState } from 'react'

export const mainContext = React.createContext<MainContext | undefined>(undefined)

export function isMainContextAvailable(): boolean {
  return !!checkContext(mainContext)
}

export function useMainContext(): MainContext {
  const ac = useContext(mainContext)

  if (!ac) {
    throw new Error("MainContext not available! useMainContext can't be used serverside")
  }

  return ac
}

export function MainContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<MainContext | undefined>(undefined)

  useEffect(() => {
    setContext(setupMainContext())
  }, [])

  return <mainContext.Provider value={context}>{children}</mainContext.Provider>
}
