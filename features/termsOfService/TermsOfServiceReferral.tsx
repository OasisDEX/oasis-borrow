import React from 'react'
import { useAccountContext } from 'components/context'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { useObservable } from 'helpers/observableHook'

export default function TermsOfServiceReferral() {
  const { userReferral$ } = useAccountContext()
  const [userReferral] = useObservable(userReferral$)

  return <TermsOfService userReferral={userReferral} />
}
