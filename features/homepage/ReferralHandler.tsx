import React, { useEffect, useState } from 'react'
import { ensNameToAddressMainnet } from 'blockchain/ens'
import { useAccountContext, useMainContext } from 'components/context'
import { isAddress } from 'ethers/lib/utils'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { useRouter } from 'next/router'

export function ReferralHandler() {
  const { query, isReady } = useRouter()
  const { context$ } = useMainContext()
  const { userReferral$ } = useAccountContext()
  const [context] = useObservable(context$)
  const [userReferral] = useObservable(userReferral$)

  const referralsEnabled = useFeatureToggle('Referrals')
  const [landedWithRef, setLandedWithRef] = useState(false)
  const [localReferral, setLocalReferral] = useLocalStorage('referral', '')

  useEffect(() => {
    if (!localReferral && referralsEnabled) {
      const linkReferral = query.ref as string
      const isReferrerAddress = isAddress(linkReferral)

      if (linkReferral && context && isReferrerAddress) {
        setLocalReferral(linkReferral)
        setLandedWithRef(true)
        if (userReferral) userReferral.trigger()
      } else if (linkReferral && context && !isReferrerAddress) {
        ensNameToAddressMainnet(linkReferral)
          .then((resolvedAddress) => {
            setLocalReferral(resolvedAddress)
            setLandedWithRef(true)
            if (userReferral) userReferral.trigger()
          })
          .catch((error) => {
            console.error('Error getting ensName for referral', linkReferral, error)
          })
      }
    }
  }, [context, isReady, localReferral, query.ref, referralsEnabled, setLocalReferral, userReferral])

  return (
    <>
      {referralsEnabled && landedWithRef && context?.status === 'connectedReadonly' && (
        <NewReferralModal />
      )}
      {referralsEnabled && <TermsOfService userReferral={userReferral} />}
    </>
  )
}
