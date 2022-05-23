import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { getAddress } from 'ethers/lib/utils'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Text } from 'theme-ui'

import { FeesView } from './FeesView'
import { ReferralsView } from './ReferralsView'
import { UserReferralState } from './user'

interface Props {
  context: Context
  address: string
  userReferral: UserReferralState
}

export function ReferralsSummary({ address }: { address: string }) {
  const { context$, userReferral$ } = useAppContext()

  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [context, contextError] = useObservable(context$)
  const [userReferral, userReferralError] = useObservable(userReferral$)

  return (
    <WithErrorHandler error={[contextError, userReferralError]}>
      <WithLoadingIndicator value={[context, userReferral]}>
        {([context, userReferral]) => (
          <ReferralOverviewView
            context={context}
            userReferral={userReferral}
            address={checksumAddress}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

export function ReferralOverviewView({ context, userReferral, address }: Props) {
  const { t } = useTranslation()

  const isConnected = context?.status === 'connected'

  const connectedAccount = isConnected ? context.account : undefined

  return (
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      <Flex sx={{ mt: '48px', mb: 4, flexDirection: 'column' }}>
        {isConnected && connectedAccount === address && userReferral.state !== 'newUser' && (
          <>
            <Grid
              columns={[1, null, 1]}
              sx={{
                justifyItems: 'center',
                position: 'relative',
                maxWidth: '688px',
                gap: '8px',
                margin: '0 auto',
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

              <>
                <ReferralsView
                  context={context}
                  address={connectedAccount}
                  userReferral={userReferral}
                />
                <FeesView context={context} userReferral={userReferral} />
              </>

              <Text variant="text.headerSettings" pt="12px" sx={{ fontSize: 4 }}>
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
        )}
      </Flex>
    </Grid>
  )
}
