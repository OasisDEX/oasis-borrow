import { setupProductContext } from 'helpers/context/ProductContext'
import type { ProductContext } from 'helpers/context/ProductContext.types'
import type { PropsWithChildren } from 'react'
import React, { useContext as checkContext, useContext, useEffect, useState } from 'react'

import { useAccountContext } from './AccountContextProvider'
import { useMainContext } from './MainContextProvider'

export const productContext = React.createContext<ProductContext | undefined>(undefined)

export function isProductContextAvailable(): boolean {
  return !!checkContext(productContext)
}

export function useProductContext(): ProductContext {
  const ac = useContext(productContext)
  if (!ac) {
    throw new Error("ProductContext not available! useProductContext can't be used serverside")
  }
  return ac
}

/*
  This component is providing streams of data used for rendering whole app (ProductContext).
  It depends on web3 - which for now is only provided by Client side.
  To block rendering of given page eg. '/trade' setup conditional rendering
  on top of that page with isProductContextAvailable.
*/

export function ProductContextProvider({ children }: PropsWithChildren<{}>) {
  const [context, setContext] = useState<ProductContext | undefined>(undefined)
  const mainContext = useMainContext()
  const accountContext = useAccountContext()

  useEffect(() => {
    setContext(setupProductContext(mainContext, accountContext))
  }, [accountContext, mainContext])

  return <productContext.Provider value={context}>{children}</productContext.Provider>
}
