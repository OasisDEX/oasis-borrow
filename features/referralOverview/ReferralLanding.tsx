import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useRedirect } from 'helpers/useRedirect'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Image, Text } from 'theme-ui'

import { useModal } from '../../helpers/modalHook'
import { UpsertUser } from './FeesView'
import { ReferralLayout } from './ReferralLayout'
import { UserReferralState } from './user'
import { createUserUsingApi$ } from './userApi'

interface Props {
  context: Context
  userReferral: UserReferralState
}

export function ReferralLandingSummary() {
  const { context$, userReferral$ } = useAppContext()

  const [context, contextError] = useObservable(context$)
  const [userReferral, userReferralError] = useObservable(userReferral$)

  return (
    <WithErrorHandler error={[contextError, userReferralError]}>
      <WithLoadingIndicator value={[context, userReferral]}>
        {([context, userReferral]) => (
          <ReferralLanding context={context} userReferral={userReferral} />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

export function ReferralLanding({ context, userReferral }: Props) {
  const { t } = useTranslation()
  const openModal = useModal()
  const { replace } = useRedirect()

  const isConnected = context?.status === 'connected'

  const connectedAccount = isConnected ? context.account : undefined

  const createUser = async (upsertUser: UpsertUser) => {
    const { hasAccepted, isReferred } = upsertUser

    if (userReferral && connectedAccount) {
      const jwtToken = jwtAuthGetToken(connectedAccount)
      if (jwtToken)
        createUserUsingApi$(
          hasAccepted,
          isReferred ? userReferral.referrer : null,
          connectedAccount,
          jwtToken,
        ).subscribe((res) => {
          if (res === 200) {
            replace(`/referrals/${connectedAccount}`)
          }
        })
    }
  }

  return (
    <ReferralLayout>
      <Flex
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          mb: '16px',
        }}
      >
        <Image
          src={staticFilesRuntimeUrl('/static/img/referral_landing.svg')}
          mb="8px"
          width="240px"
          py="58px"
        />

        <Text variant="text.headerSettings" pt="0px" pb="12px">
          {t('ref.how')}
        </Text>
        <Text variant="text.subheader" pt="12px">
          {isConnected ? (
            <Trans i18nKey="ref.how-p1-connected">
              1. Click <span style={{ fontWeight: 600 }}>‘Get Started’</span> below
            </Trans>
          ) : (
            t('ref.how-p1-not-connected')
          )}
        </Text>
        <Text variant="text.subheader" pt="12px">
          {t('ref.how-p2')}
        </Text>
        <Text variant="text.subheader" pt="12px">
          {t('ref.how-p3')}
        </Text>
      </Flex>
      {context?.status !== 'connected' ? (
        <AppLink
          variant="primary"
          href="/connect"
          sx={{
            display: 'flex',
            margin: '0 auto',
            px: '40px',
            py: 2,
            color: 'offWhite',
            alignItems: 'center',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
          }}
        >
          {t('connect-wallet-button')}
          <Icon
            name="arrow_right"
            sx={{
              ml: 2,
              position: 'relative',
              left: 2,
              transition: '0.2s',
            }}
          />
        </AppLink>
      ) : null}
      {userReferral.state === 'newUser' && (
        <Button
          variant="primary"
          sx={{
            display: 'flex',
            margin: '0 auto',
            px: '40px',
            py: 2,
            color: 'offWhite',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
            width: '274px',
          }}
          // if new user witohut refereal - write to db on click and redirect to dashboard
          onClick={
            userReferral.referrer
              ? () =>
                  openModal(NewReferralModal, {
                    userReferral,
                    account: connectedAccount,
                  })
              : () => createUser({ hasAccepted: true, isReferred: false })
          }
        >
          {t('ref.get-started')}
          <Icon
            name="arrow_right"
            sx={{
              ml: 2,
              position: 'relative',
              left: 2,
              transition: '0.2s',
            }}
          />
        </Button>
      )}{' '}
      {userReferral.state === 'currentUser' && (
        <AppLink
          variant="primary"
          href={`/referrals/${connectedAccount}`}
          sx={{
            display: 'flex',
            margin: '0 auto',
            px: '40px',
            py: 2,
            color: 'offWhite',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
            width: '274px',
          }}
        >
          {t('ref.get-started')}
          <Icon
            name="arrow_right"
            sx={{
              ml: 2,
              position: 'relative',
              left: 2,
              transition: '0.2s',
            }}
          />
        </AppLink>
      )}
    </ReferralLayout>
  )
}
