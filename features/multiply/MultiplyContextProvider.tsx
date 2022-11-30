import { useAppContext } from 'components/AppContextProvider'
import { WithChildren } from 'helpers/types'
import React, { useContext, useEffect, useState } from 'react'

import { MultiplyContext, setupMultiplyContext } from './MultiplyContext'

export const multiplyContext = React.createContext<MultiplyContext | undefined>(undefined)
const { Provider } = multiplyContext

export function isMultiplyContextAvailable(): boolean {
  return !!useContext(multiplyContext)
}

export function useMultiplyContext(): MultiplyContext {
  const ac = useContext(multiplyContext)
  if (!ac) {
    throw new Error("MultiplyContext not available! useAppContext can't be used serverside")
  }
  return ac
}

export function MultiplyContextProvider({ children }: WithChildren) {
  const appContext = useAppContext()
  const [context, setContext] = useState<MultiplyContext | undefined>(undefined)

  useEffect(() => {
    if (appContext) {
      setContext(setupMultiplyContext(appContext))
    }
  }, [appContext])

  return <Provider value={context}>{children}</Provider>
}
