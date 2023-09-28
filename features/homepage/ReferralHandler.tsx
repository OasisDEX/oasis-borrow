import { ensNameToAddressMainnet } from 'blockchain/ens'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { isAddress } from 'ethers/lib/utils'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { useAppConfig } from 'helpers/config'
import { useObservable } from 'helpers/observableHook'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

export default function ReferralHandler() {
  const { query, isReady } = useRouter()
  const { context$ } = useMainContext()
  const { userReferral$ } = useAccountContext()
  const [context] = useObservable(context$)
  const [userReferral] = useObservable(userReferral$)

  const { Referrals: referralsEnabled } = useAppConfig('features')
  const [landedWithRef, setLandedWithRef] = useState(false)
  const [localReferral, setLocalReferral] = useLocalStorage('referral', '')
  useEffect(() => {
    if (!localReferral && referralsEnabled) {
      const linkReferral = query.ref as string
      const isReferrerAddress = isAddress(linkReferral)

      if (linkReferral && context && isReferrerAddress) {
        setLocalReferral(linkReferral)
        setLandedWithRef(true)
        if (userReferral && userReferral.trigger && !userReferral.referrer) userReferral.trigger()
      } else if (linkReferral && context && !isReferrerAddress) {
        ensNameToAddressMainnet(linkReferral)
          .then((resolvedAddress) => {
            setLocalReferral(resolvedAddress)
            setLandedWithRef(true)
            if (userReferral && userReferral.trigger && !userReferral.referrer)
              userReferral.trigger()
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
