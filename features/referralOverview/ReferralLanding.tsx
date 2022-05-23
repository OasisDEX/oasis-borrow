import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { NewReferralModal } from 'components/NewReferralModal'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useRedirect } from 'helpers/useRedirect'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Grid, Image, Text } from 'theme-ui'

import { useModal } from '../../helpers/modalHook'
import { fadeInAnimation } from '../../theme/animations'
import { UpsertUser } from './FeesView'
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
          isReferred ? userReferral.referrer.referrer : null,
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
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      <Flex sx={{ mt: '48px', mb: 4, flexDirection: 'column' }}>
        <>
          <Grid
            columns={[1, null, 1]}
            sx={{
              justifyItems: 'center',
              position: 'relative',
              maxWidth: '688px',
              gap: '8px',
              margin: '0 auto',
              ...fadeInAnimation,
            }}
          >
            <Text variant="text.header2">{t('ref.ref-a-friend')}</Text>
            <Text variant="text.paragraph2" sx={{ textAlign: 'center', color: 'lavender' }}>
              {t('ref.intro-1')}{' '}
              <AppLink
                href={`https://kb.oasis.app/help/tbd`}
                target="_blank"
                sx={{
                  fontSize: 3,
                  '&:hover svg': {
                    transform: 'translateX(10px)',
                  },
                }}
                variant="inText"
              >
                {' '}
                {t('ref.intro-link')}{' '}
                <Icon
                  name="arrow_right"
                  size="12px"
                  sx={{
                    ml: 2,
                    position: 'relative',
                    transition: '0.2s',
                  }}
                />
              </AppLink>
            </Text>
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

            {context?.status === 'connected' ? (
              userReferral.state === 'newUser' ? (
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
                    userReferral.referrer.referrer
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
              ) : (
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
              )
            ) : (
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
            )}

            <Text variant="text.headerSettings" pt="40px" sx={{ fontSize: 4 }}>
              {t('ref.need-help')}
            </Text>
            <AppLink
              variant="inText"
              target="_blank"
              href="https://kb.oasis.app/help/tbd"
              sx={{
                pt: '8px',
                fontSize: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover svg': {
                  transform: 'translateX(10px)',
                },
              }}
            >
              {t('ref.help-link-1')}{' '}
              <Icon
                name="arrow_right"
                size="12px"
                sx={{
                  ml: 2,
                  position: 'relative',
                  transition: '0.2s',
                }}
              />
            </AppLink>
            <AppLink
              variant="inText"
              target="_blank"
              href="https://kb.oasis.app/help/tbd"
              sx={{
                pt: '8px',
                fontSize: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover svg': {
                  transform: 'translateX(10px)',
                },
              }}
            >
              {t('ref.help-link-2')}{' '}
              <Icon
                name="arrow_right"
                size="12px"
                sx={{
                  ml: 2,
                  position: 'relative',
                  transition: '0.2s',
                }}
              />
            </AppLink>
          </Grid>
        </>
      </Flex>
    </Grid>
  )
}
