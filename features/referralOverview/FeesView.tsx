import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { formatAddress } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Card, Divider, Flex, Grid, Text } from 'theme-ui'
import { Spinner } from 'theme-ui'

import { fadeInAnimation } from '../../theme/animations'
import { ClaimTxnState, UserReferralState } from './user'
import { createUserUsingApi$ } from './userApi'

interface Props {
  context: Context
  userReferral: UserReferralState
}
export interface UpsertUser {
  hasAccepted: boolean
  isReferred: boolean
}

export function FeesView({ userReferral }: Props) {
  const { t } = useTranslation()

  // move to pipe

  const createUser = async (upsertUser: UpsertUser) => {
    const { hasAccepted, isReferred } = upsertUser

    if (userReferral.user) {
      const jwtToken = jwtAuthGetToken(userReferral.user.address)
      if (jwtToken)
        createUserUsingApi$(
          hasAccepted,
          isReferred ? userReferral.user.user_that_referred_address : null,
          userReferral.user.address,
          jwtToken,
        ).subscribe((res) => {
          res === 200 ? userReferral.trigger && userReferral.trigger() : null
        })
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        pb: '40px',
      }}
    >
      <Card
        sx={{
          backgroundColor: '#ffffff',
          borderColor: 'border',
          borderWidth: '1px',
          borderTop: 'none',
          p: 4,
          height: '100%',
          ...fadeInAnimation,
        }}
      >
        <Grid columns={[1, 3, 3]}>
          <Box sx={{ py: 1 }}>
            <Text
              sx={{
                color: 'text.subtitle',

                fontSize: 1,
              }}
              variant="strong"
            >
              {t('ref.total')}
            </Text>
            <Text
              sx={{
                fontSize: 7,
              }}
              variant="strong"
            >
              {`${userReferral.totalAmount}`} <span style={{ fontSize: '18px' }}>DAI</span>
            </Text>
          </Box>
          <Box sx={{ py: 1 }}>
            <Box sx={{ flex: '1 1 auto' }}>
              <Text
                sx={{
                  color: 'text.subtitle',
                  fontSize: 1,
                }}
                variant="strong"
              >
                {t('ref.not-claimed')}
              </Text>
              <Text
                sx={{
                  fontSize: 7,
                }}
                variant="strong"
              >
                {userReferral.claimTxnState === ClaimTxnState.SUCCEEDED
                  ? '0.00'
                  : `${userReferral.totalClaim}`}{' '}
                <span style={{ fontSize: '18px' }}>DAI</span>
              </Text>
            </Box>
          </Box>
          <Flex sx={{ alignItems: ['start', 'end', 'end'], flexDirection: 'column', py: 1 }}>
            <Button
              variant="outline"
              disabled={
                !userReferral.claims || userReferral.claimTxnState === ClaimTxnState.PENDING
              }
              onClick={() =>
                userReferral.performClaimMultiple ? userReferral.performClaimMultiple() : null
              }
              sx={{ p: '4px' }}
            >
              <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                {userReferral.claimTxnState === ClaimTxnState.PENDING ? (
                  <Spinner size={30} color="main" />
                ) : (
                  <Icon name="dai_circle_color" size="30px" />
                )}
                <Text px="2" sx={{ whiteSpace: 'nowrap' }}>
                  {userReferral.claimTxnState !== ClaimTxnState.PENDING
                    ? !userReferral.claims
                      ? t('ref.no-claim')
                      : t('ref.claim')
                    : t('ref.claiming')}
                </Text>
              </Flex>
            </Button>
          </Flex>
        </Grid>{' '}
        <Divider sx={{ my: '16px' }} />
        <Flex
          sx={{
            flexDirection: 'column',
            justifyContent: 'start',
          }}
        >
          <Box sx={{ py: '20px' }}>
            <Text
              sx={{
                color: 'text',
                overflowWrap: 'break-word',
                fontSize: 4,
              }}
              variant="strong"
            >
              {t('ref.you-referred')}
            </Text>
            {userReferral.referrals &&
              userReferral.referrals.map((item, index) => (
                <Box key={index}>
                  <Flex sx={{ pt: '12px', flexWrap: 'wrap', alignItems: 'center' }} key={index}>
                    <Box sx={{ flex: '1 1 auto' }}>
                      <Text
                        sx={{
                          color: 'text.subtitle',
                          overflowWrap: 'break-word',
                          fontSize: 2,
                        }}
                        variant="subtitle"
                      >
                        {item}{' '}
                      </Text>
                    </Box>
                    <Box>
                      <AppLink
                        href={`https://etherscan.com/account/${item}`}
                        sx={{ fontSize: 2 }}
                        variant="inText"
                      >
                        {' '}
                        Etherscan
                      </AppLink>
                    </Box>
                  </Flex>
                </Box>
              ))}
            {userReferral.referrals && userReferral.referrals.length === 0 && (
              <Box>
                <Flex sx={{ pt: '12px', flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 auto' }}>
                    <Text
                      sx={{
                        color: 'text.subtitle',
                        overflowWrap: 'break-word',
                        fontSize: 2,
                      }}
                      variant="subtitle"
                    >
                      {t('ref.not-referred-yet')}
                    </Text>
                  </Box>
                  <Box>
                    <AppLink
                      href={`https://etherscan.com/account/#`}
                      sx={{ fontSize: 2 }}
                      variant="inText"
                    >
                      {' '}
                    </AppLink>
                  </Box>
                </Flex>
              </Box>
            )}
          </Box>
          <Box sx={{ py: '10px' }}>
            <Text
              sx={{
                color: 'text',
                overflowWrap: 'break-word',
                fontSize: 4,
              }}
              variant="strong"
            >
              {t('ref.referred-you')}
            </Text>

            <Flex sx={{ pt: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 auto' }}>
                <Text
                  sx={{
                    color: 'text.subtitle',
                    overflowWrap: 'break-word',
                    fontSize: 2,
                  }}
                  variant="subtitle"
                >
                  {userReferral.referrer.referrer &&
                    !userReferral.invitePending &&
                    userReferral.referrer.referrer}{' '}
                  {!userReferral.referrer.referrer &&
                    !userReferral.invitePending &&
                    t(`ref.you-were-not-referred`)}
                  {userReferral.referrer.referrer &&
                    userReferral.invitePending &&
                    `${t('ref.you-have-been-invited')} ${formatAddress(
                      userReferral.referrer.referrer,
                      6,
                    )}`}
                </Text>
              </Box>
              <Box>
                {userReferral.state === 'currentUser' && !userReferral.invitePending && (
                  <AppLink
                    href={`https://etherscan.com/account/#`}
                    sx={{ fontSize: 2 }}
                    variant="inText"
                  >
                    {' '}
                    Etherscan
                  </AppLink>
                )}
                {userReferral.state === 'currentUser' && userReferral.invitePending && (
                  <>
                    {' '}
                    <Button
                      sx={{ fontSize: 2 }}
                      variant="textual"
                      onClick={() => createUser({ hasAccepted: true, isReferred: true })}
                    >
                      {' '}
                      {t(`ref.accept-invite`)}
                    </Button>
                    |
                    <Button
                      sx={{ fontSize: 2 }}
                      variant="textual"
                      onClick={() => createUser({ hasAccepted: false, isReferred: false })}
                    >
                      {' '}
                      {t(`ref.reject-invite`)}
                    </Button>
                  </>
                )}
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Card>
    </Box>
  )
}
