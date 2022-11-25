import { useAppContext } from 'components/AppContextProvider'
import { WithChildren } from 'helpers/types'
import React, { useContext, useEffect, useState } from 'react'

interface DsrContext {

}

export const dsrContext = React.createContext<DsrContext | undefined>(undefined)

export function isAppContextAvailable(): boolean {
  return !!useContext(dsrContext)
}

export function useDsrContext(): DsrContext {
  const ac = useContext(dsrContext)
  if (!ac) {
    throw new Error("DsrContext not available! useAppContext can't be used serverside")
  }
  return ac
}

export function DsrContextProvider({ children }: WithChildren) {
  const appContext = useAppContext()
  const [context, setContext] = useState<DsrContext | string>('hehe')

  useEffect(() => {
    if (appContext) {
      // setContext(setupDsrContext(appContext))
    }
  }, [appContext])

  return <dsrContext.Provider value={context}>{children}</dsrContext.Provider>
}
