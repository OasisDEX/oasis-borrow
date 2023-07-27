import { AppContextProvider, useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'

import { TermsOfService } from './TermsOfService'

export default function TermsOfServiceReferral() {
  const { userReferral$ } = useAppContext()
  const [userReferral] = useObservable(userReferral$)
  return (
    <AppContextProvider>
      <TermsOfService userReferral={userReferral} />
    </AppContextProvider>
  )
}
