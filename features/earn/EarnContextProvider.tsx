import { useAppContext } from 'components/AppContextProvider'
import { WithChildren } from 'helpers/types'
import React, { useContext, useEffect, useState } from 'react'

import { EarnContext, setupEarnContext } from './EarnContext'

export const earnContext = React.createContext<EarnContext | undefined>(undefined)

export function isEarnContextAvailable(): boolean {
  return !!useContext(earnContext)
}

export function useEarnContext(): EarnContext {
  const ac = useContext(earnContext)
  if (!ac) {
    throw new Error("EarnContext not available! useAppContext can't be used serverside")
  }
  return ac
}

export function EarnContextProvider({ children }: WithChildren) {
  const appContext = useAppContext()
  const [context, setContext] = useState<EarnContext | undefined>(undefined)

  useEffect(() => {
    if (appContext) {
      setContext(setupEarnContext(appContext))
    }
  }, [appContext])

  return <earnContext.Provider value={context}>{children}</earnContext.Provider>
}
