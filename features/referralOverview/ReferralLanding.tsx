import type { Context } from 'blockchain/network.types'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { tosContext } from 'components/context/TOSContextProvider'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { NewReferralModal } from 'features/referralOverview/NewReferralModal'
import { TermsOfService } from 'features/termsOfService/TermsOfService'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useModal } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useRedirect } from 'helpers/useRedirect'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { arrow_right } from 'theme/icons'
import { Box, Button, Flex, Image, Text } from 'theme-ui'

import type { UpsertUser } from './FeesView'
import { ReferralLayout } from './ReferralLayout'
import type { UserReferralState } from './user.types'
import { createUserUsingApi$ } from './userApi'

interface Props {
  context: Context
  userReferral: UserReferralState
}

export function ReferralLandingSummary() {
  const { context$ } = useMainContext()
  const { userReferral$ } = useAccountContext()

  const [context, contextError] = useObservable(context$)
  const [userReferral, userReferralError] = useObservable(userReferral$)

  return (
    <DeferedContextProvider context={tosContext}>
      <WithErrorHandler error={[contextError, userReferralError]}>
        <WithLoadingIndicator value={[context, userReferral]}>
          {([_context, _userReferral]) => (
            <ReferralLanding context={_context} userReferral={_userReferral} />
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </DeferedContextProvider>
  )
}

export function ReferralLanding({ context, userReferral }: Props) {
  const { t } = useTranslation()
  const openModal = useModal()
  const { replace } = useRedirect()
  const { connect, connecting } = useConnection()

  const isConnected = context?.status === 'connected'

  const connectedAccount = isConnected ? context.account : undefined

  const createUser = async (upsertUser: UpsertUser) => {
    const { hasAccepted, isReferred } = upsertUser

    if (userReferral && connectedAccount) {
      createUserUsingApi$(
        hasAccepted,
        isReferred ? userReferral.referrer : null,
        connectedAccount,
      ).subscribe((res) => {
        if (res === 200) {
          userReferral.trigger()
          replace(`/referrals/${connectedAccount}`)
        }
      })
    }
  }

  return (
    <ReferralLayout>
      <TermsOfService userReferral={userReferral} />
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
          width="300px"
          py="58px"
        />

        <Text as="p" variant="boldParagraph1" pt="0px" pb="12px">
          {t('ref.how')}
        </Text>
        <Text variant="paragraph2" sx={{ color: 'neutral80' }} pt="12px">
          {isConnected ? (
            <Trans i18nKey="ref.how-p1-connected">
              1. Click <span style={{ fontWeight: 600 }}>‘Get Started’</span> below
            </Trans>
          ) : (
            t('ref.how-p1-not-connected')
          )}
        </Text>
        <Text variant="paragraph2" sx={{ color: 'neutral80' }} pt="12px">
          {t('ref.how-p2')}
        </Text>
        <Text variant="paragraph2" sx={{ color: 'neutral80' }} pt="12px">
          {t('ref.how-p3')}
        </Text>
      </Flex>
      <Box mt={`16px`}>
        {context?.status !== 'connected' ? (
          <Button
            variant="primary"
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
            onClick={() => {
              if (!connecting) {
                connect()
              }
            }}
          >
            {t('connect-wallet-button')}
            <Icon
              icon={arrow_right}
              sx={{
                ml: 2,
                position: 'relative',
                left: 2,
                transition: '0.2s',
              }}
            />
          </Button>
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
              icon={arrow_right}
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
              icon={arrow_right}
              sx={{
                ml: 2,
                position: 'relative',
                left: 2,
                transition: '0.2s',
              }}
            />
          </AppLink>
        )}
      </Box>
    </ReferralLayout>
  )
}
