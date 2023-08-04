import { useAccountContext } from 'components/context/AccountContextProvider'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

import { TermsOfService } from './TermsOfService'

export default function TermsOfServiceReferral() {
  const { userReferral$ } = useAccountContext()
  const [userReferral] = useObservable(userReferral$)
  return <TermsOfService userReferral={userReferral} />
}
