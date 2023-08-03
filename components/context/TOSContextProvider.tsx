import { currentContent } from 'features/content'
import { jwtAuthSetupToken$ } from 'features/shared/jwt'
import {
  createTermsAcceptance$,
  TermsAcceptanceState,
} from 'features/termsOfService/termsAcceptance'
import {
  checkAcceptanceFromApi$,
  saveAcceptanceFromApi$,
} from 'features/termsOfService/termsAcceptanceApi'
import { DepreciatedServices } from 'helpers/context/types'
import { WithChildren } from 'helpers/types'
import React, { useContext as checkContext, useContext, useEffect, useState } from 'react'
import { Observable } from 'rxjs'

import { useMainContext } from './MainContextProvider'

export const tosContext = React.createContext<TOSContextType | undefined>(undefined)

export function isTOSContextAvailable(): boolean {
  return !!checkContext(tosContext)
}

export function useTOSContext(): TOSContextType {
  const ac = useContext(tosContext)
  if (!ac) {
    throw new Error("TOSContext not available! useTOSContext can't be used serverside")
  }
  return ac
}

export function TOSContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<TOSContextType | undefined>(undefined)
  const { web3Context$, txHelpers$ } = useMainContext()

  useEffect(() => {
    setContext(() => {
      console.log('Terms of service context setup')
      const termsAcceptance$ = createTermsAcceptance$(
        web3Context$,
        currentContent.tos.version,
        jwtAuthSetupToken$,
        checkAcceptanceFromApi$,
        saveAcceptanceFromApi$,
      )

      return {
        termsAcceptance$,
      }
    })
  }, [txHelpers$, web3Context$])

  return <tosContext.Provider value={context}>{children}</tosContext.Provider>
}

export type TOSContextType = {
  termsAcceptance$: Observable<TermsAcceptanceState>
} & DepreciatedServices
