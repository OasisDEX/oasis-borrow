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
import { useTranslation } from 'next-i18next'
import { Button, Flex, Grid, Image, Text } from 'theme-ui'

import { useModal } from '../../helpers/modalHook'
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
          res === 200 ? replace(`/referrals/${connectedAccount}`) : null
        })
    }
  }

  return (
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      <Flex sx={{ mt: 1, mb: 4, flexDirection: 'column' }}>
        <>
          <Grid
            columns={[1, null, 1]}
            sx={{
              justifyItems: 'center',
              position: 'relative',
              maxWidth: '688px',
              gap: 4,
              margin: '0 auto',
            }}
          >
            <Text variant="text.header2">{t('ref.ref-a-friend')}</Text>
            <Text variant="text.paragraph2" sx={{ textAlign: 'center', color: 'lavender' }}>
              {t('ref.intro-1')}{' '}
              <AppLink href={`#`} sx={{ fontSize: 2 }} variant="inText">
                {' '}
                {t('ref.intro-link')}
              </AppLink>
            </Text>
            <Flex sx={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Image
                src={staticFilesRuntimeUrl('/static/img/referral_landing.svg')}
                mb="16px"
                width="240px"
                py="32px"
              />
              <Text variant="text.headerSettings" py="4px">
                {t('ref.how')}
              </Text>
              <Text variant="text.subheader" py="12px">
                {isConnected ? t('ref.how-p1-connected') : t('ref.how-p1-not-connected')}
              </Text>
              <Text variant="text.subheader" py="12px">
                {t('ref.how-p2')}
              </Text>
              <Text variant="text.subheader" py="12px">
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
                    '&:hover svg': {
                      transform: 'translateX(10px)',
                    },
                  }}
                  // if new user witohut refereal - write to db on click and redirect to dashboard
                  onClick={
                    userReferral.referrer.referrer
                      ? () =>
                          openModal(NewReferralModal, {
                            referrer: userReferral.referrer.referrer,
                            address: connectedAccount,
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
                    '&:hover svg': {
                      transform: 'translateX(10px)',
                    },
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

            <Text variant="text.headerSettings" pt="12px">
              {t('ref.need-help')}
            </Text>
            <AppLink variant="inText" href="#">
              {t('ref.help-link-1')}
            </AppLink>
            <AppLink variant="inText" href="#">
              {t('ref.help-link-2')}
            </AppLink>
          </Grid>
        </>
      </Flex>
    </Grid>
  )
}
