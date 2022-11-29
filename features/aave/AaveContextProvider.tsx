import React, { useContext, useEffect, useState } from 'react'

import { useAppContext } from '../../components/AppContextProvider'
import { WithChildren } from '../../helpers/types'
import { AaveContext, setupAaveContext } from './AaveContext'

export const aaveContext = React.createContext<AaveContext | undefined>(undefined)

export function isAaveContextAvailable(): boolean {
  return !!useContext(aaveContext)
}

export function useAaveContext(): AaveContext {
  const ac = useContext(aaveContext)
  if (!ac) {
    throw new Error("AaveContext not available! useAppContext can't be used serverside")
  }
  return ac
}

export function AaveContextProvider({ children }: WithChildren) {
  const appContext = useAppContext()
  const [context, setContext] = useState<AaveContext | undefined>(undefined)

  useEffect(() => {
    if (appContext) {
      setContext(setupAaveContext(appContext))
    }
  }, [appContext])

  return <aaveContext.Provider value={context}>{children}</aaveContext.Provider>
}
