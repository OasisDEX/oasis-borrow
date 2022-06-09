import { UserReferralState } from 'features/referralOverview/user'
import { createUserUsingApi$ } from 'features/referralOverview/userApi'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { formatAddress } from 'helpers/formatters/format'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { ReferralModal } from '../../components/ReferralModal'
import { SuccessfulJoinModal } from '../../components/SuccessfullJoinModal'

interface NewReferralModalProps {
  account?: string | null
  userReferral?: UserReferralState | null
}

interface UpsertUser {
  hasAccepted: boolean
  isReferred: boolean
}

export function NewReferralModal({ account, userReferral }: NewReferralModalProps) {
  const { t } = useTranslation()
  const [success, setSuccess] = useState(false)
  const { push } = useRedirect()
  const createUser = async (upsertUser: UpsertUser) => {
    const { hasAccepted, isReferred } = upsertUser

    if (userReferral && account) {
      const jwtToken = jwtAuthGetToken(account)
      if (jwtToken)
        createUserUsingApi$(
          hasAccepted,
          isReferred ? userReferral.referrer : null,
          account,
          jwtToken,
        ).subscribe((res) => {
          if (res === 200) {
            hasAccepted ? setSuccess(true) : userReferral.trigger()
          }
        })
    }
  }

  return (
    <>
      {!success && !userReferral && (
        <ReferralModal
          heading="Welcome to the Oasis.app Referral Program"
          topButton={{ text: t('connect-wallet'), func: () => push('/connect') }}
        />
      )}
      {!success && userReferral && userReferral.state === 'newUser' && (
        <ReferralModal
          heading={`${t('ref.modal.you-have-been-ref')} ${formatAddress(
            userReferral.referrer!,
            6,
          )}`}
          topButton={{
            text: t('ref.modal.accept'),
            func: () => createUser({ hasAccepted: true, isReferred: true }),
          }}
          bottomButton={{
            text: t('ref.modal.later'),
            func: () => createUser({ hasAccepted: false, isReferred: true }),
          }}
        />
      )}
      {success && userReferral && account && (
        <SuccessfulJoinModal
          account={account}
          userReferral={userReferral}
          heading={t('ref.modal.successful-join')}
        ></SuccessfulJoinModal>
      )}{' '}
    </>
  )
}
