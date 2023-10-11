import { useMainnetEnsName } from 'blockchain/ens'
import { ReferralModal } from 'components/ReferralModal'
import { SuccessfulJoinModal } from 'components/SuccessfullJoinModal'
import { createUserUsingApi$ } from 'features/referralOverview/userApi'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { formatAddress } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import type { UserReferralState } from './user.types'

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
  const { connect } = useConnection()
  const [refEnsName] = useMainnetEnsName(userReferral?.referrer)
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
          } else {
            console.error('Error creating user')
            localStorage.removeItem(`referral`)
            userReferral.trigger()
          }
        })
    }
  }

  return (
    <>
      {!success && !userReferral && (
        <ReferralModal
          heading="Welcome to the Summer.fi Referral Program"
          topButton={{ text: t('connect-wallet'), func: () => connect() }}
        />
      )}
      {!success && userReferral && userReferral.state === 'newUser' && refEnsName !== undefined && (
        <ReferralModal
          heading={`${t('ref.modal.you-have-been-ref')} ${
            refEnsName || formatAddress(userReferral.referrer!, 6)
          }`}
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
