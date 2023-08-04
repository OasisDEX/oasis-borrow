import { useReferralContext } from 'components/context/ReferralContextProvider'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

import { TermsOfService } from './TermsOfService'

export default function TermsOfServiceReferral() {
  const { userReferral$ } = useReferralContext()
  const [userReferral] = useObservable(userReferral$)
  return <TermsOfService userReferral={userReferral} />
}
