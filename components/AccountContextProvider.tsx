import { AccountContext, setupAccountContext } from 'helpers/context/AccountContext'
import { WithChildren } from 'helpers/types'
import React, { useContext as checkContext, useContext, useEffect, useState } from 'react'

export const accountContext = React.createContext<AccountContext | undefined>(undefined)

export function isAccountContextAvailable(): boolean {
  return !!checkContext(accountContext)
}

export function useAccountContext(): AccountContext {
  const ac = useContext(accountContext)
  if (!ac) {
    throw new Error("AccountContext not available! useAccountContext can't be used serverside")
  }
  return ac
}

export function AccountContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<AccountContext | undefined>(undefined)

  useEffect(() => {
    setContext(setupAccountContext())
  }, [])

  return <accountContext.Provider value={context}>{children}</accountContext.Provider>
}
