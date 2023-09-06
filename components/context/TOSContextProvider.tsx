import React, { useContext as checkContext, useContext, useEffect, useState } from 'react'
import { useMainContext } from 'components/context/MainContextProvider'
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
import { createWalletAssociatedRisk$ } from 'features/walletAssociatedRisk/walletRisk'
import { WalletRiskResponse } from 'features/walletAssociatedRisk/walletRiskApi'
import { DepreciatedServices } from 'helpers/context/types'
import { WithChildren } from 'helpers/types'
import { Observable } from 'rxjs'

export const tosContext = React.createContext<TOSContext | undefined>(undefined)

export function isTOSContextAvailable(): boolean {
  return !!checkContext(tosContext)
}

export function useTOSContext(): TOSContext {
  const ac = useContext(tosContext)

  if (!ac) {
    throw new Error("TOSContext not available! useTOSContext can't be used serverside")
  }

  return ac
}

export function TOSContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<TOSContext | undefined>(undefined)
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

      const walletAssociatedRisk$ = createWalletAssociatedRisk$(web3Context$, termsAcceptance$)

      return {
        termsAcceptance$,
        walletAssociatedRisk$,
      }
    })
  }, [txHelpers$, web3Context$])

  return <tosContext.Provider value={context}>{children}</tosContext.Provider>
}

export type TOSContext = {
  termsAcceptance$: Observable<TermsAcceptanceState>
  walletAssociatedRisk$: Observable<WalletRiskResponse | undefined>
} & DepreciatedServices
