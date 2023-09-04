import { useAccountContext, useMainContext } from 'components/context'
import { isAddress } from 'ethers/lib/utils'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

export function ReferralHandler() {
  const { query, isReady } = useRouter()
  const { context$ } = useMainContext()
  const { checkReferralLocal$, userReferral$ } = useAccountContext()
  const [context] = useObservable(context$)
  const [userReferral] = useObservable(userReferral$)
  const [checkReferralLocal] = useObservable(checkReferralLocal$)

  const referralsEnabled = useFeatureToggle('Referrals')
  const [landedWithRef, setLandedWithRef] = useState('')
  const [localReferral, setLocalReferral] = useLocalStorage('referral', '')
  useEffect(() => {
    if (!localReferral && referralsEnabled) {
      const linkReferral = query.ref as string
      // store only the address - not the ens name - it's handled in the modal
      if (linkReferral && context && isAddress(linkReferral)) {
        console.log('isAddress', linkReferral)
        setLocalReferral(linkReferral)
        setLandedWithRef(linkReferral)
      }
    }
  }, [
    checkReferralLocal,
    context,
    isReady,
    localReferral,
    query.ref,
    referralsEnabled,
    setLocalReferral,
  ])

  return (
    <>
      {referralsEnabled && landedWithRef && context?.status === 'connectedReadonly' && (
        <NewReferralModal />
      )}
      {referralsEnabled && <TermsOfService userReferral={userReferral} />}
    </>
  )
}
