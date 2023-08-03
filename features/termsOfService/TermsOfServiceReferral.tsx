import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { useReferralContext } from 'components/context/ReferralContextProvider'
import { tosContext } from 'components/context/TOSContextProvider'
import { useObservable } from 'helpers/observableHook'

import { TermsOfService } from './TermsOfService'

function TermsOfServiceReferralProxy() {
  const { userReferral$ } = useReferralContext()
  const [userReferral] = useObservable(userReferral$)
  return <TermsOfService userReferral={userReferral} />
}

export default function TermsOfServiceReferral() {
  return (
    <DeferedContextProvider context={tosContext}>
      <TermsOfServiceReferralProxy />
    </DeferedContextProvider>
  )
}
