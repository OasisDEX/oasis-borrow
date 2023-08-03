import { checkReferralLocalStorage$ } from 'features/referralOverview/referralLocal'
import { createUserReferral$, UserReferralState } from 'features/referralOverview/user'
import {
  getReferralsFromApi$,
  getUserFromApi$,
  getWeeklyClaimsFromApi$,
} from 'features/referralOverview/userApi'
import { DepreciatedServices } from 'helpers/context/types'
import { WithChildren } from 'helpers/types'
import React, { useContext as checkContext, useContext, useEffect, useState } from 'react'
import { Observable } from 'rxjs'

import { useMainContext } from './MainContextProvider'

export const referralContext = React.createContext<ReferralContextType | undefined>(undefined)

export function isReferralContextAvailable(): boolean {
  return !!checkContext(referralContext)
}

export function useReferralContext(): ReferralContextType {
  const ac = useContext(referralContext)
  if (!ac) {
    throw new Error("ReferralContext not available! useReferralContext can't be used serverside")
  }
  return ac
}

export function ReferralContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<ReferralContextType | undefined>(undefined)
  const { web3Context$, txHelpers$ } = useMainContext()

  useEffect(() => {
    setContext(() => {
      console.log('Referral context setup')
      const userReferral$ = createUserReferral$(
        web3Context$,
        txHelpers$,
        getUserFromApi$,
        getReferralsFromApi$,
        getWeeklyClaimsFromApi$,
        checkReferralLocalStorage$,
      )

      const checkReferralLocal$ = checkReferralLocalStorage$()

      return {
        userReferral$,
        checkReferralLocal$,
      }
    })
  }, [txHelpers$, web3Context$])

  return <referralContext.Provider value={context}>{children}</referralContext.Provider>
}

export type ReferralContextType = {
  userReferral$: Observable<UserReferralState>
  checkReferralLocal$: Observable<string | null>
} & DepreciatedServices
