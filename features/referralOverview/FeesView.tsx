import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { formatAddress } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Card, Divider, Flex, Grid, Spinner, Text } from 'theme-ui'

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
          if (res === 200) {
            userReferral.trigger()
          }
        })
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        mt: '4px',
        pb: '48px',
      }}
    >
      <Card
        sx={{
          backgroundColor: 'neutral10',
          borderColor: 'border',
          borderWidth: '1px',
          p: 4,
          height: '100%',
          ...fadeInAnimation,
        }}
      >
        <Grid columns={[1, 3, 3]}>
          <Box sx={{ py: 1 }}>
            <Text
              sx={{
                color: 'neutral80',
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
                  color: 'neutral80',
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
                {/*  // leave this or delay querying the cache ? */}
                {userReferral.claimTxnState === ClaimTxnState.SUCCEEDED
                  ? '0.0'
                  : userReferral.totalClaim}
                {` `}
                <span style={{ fontSize: '18px' }}>DAI</span>
              </Text>
            </Box>
          </Box>
          <Flex sx={{ alignItems: ['start', 'end', 'end'], flexDirection: 'column', py: 1 }}>
            <Button
              variant="outline"
              disabled={
                !userReferral.claims ||
                userReferral.claimTxnState === ClaimTxnState.PENDING ||
                userReferral.claimTxnState === ClaimTxnState.SUCCEEDED
              }
              onClick={() =>
                userReferral.performClaimMultiple ? userReferral.performClaimMultiple() : null
              }
              sx={{ p: '4px', minWidth: ['100%', '138px', '138px'] }}
            >
              <Flex sx={{ justifyContent: ['center', 'flex-start'], alignItems: 'center' }}>
                {userReferral.claimTxnState === ClaimTxnState.PENDING ? (
                  <Spinner size={30} color="main" />
                ) : (
                  <Icon name="dai_circle_color" size="32px" />
                )}
                <Text pl="12px" sx={{ whiteSpace: 'nowrap', fontSize: 2 }}>
                  {userReferral.claimTxnState === ClaimTxnState.SUCCEEDED ? t('ref.claimed') : null}
                  {userReferral.claimTxnState === ClaimTxnState.PENDING ? t('ref.claiming') : null}
                  {!userReferral.claims ? t('ref.no-claim') : null}
                  {userReferral.claims &&
                  userReferral.claimTxnState !== ClaimTxnState.PENDING &&
                  userReferral.claimTxnState !== ClaimTxnState.SUCCEEDED
                    ? t('ref.claim')
                    : null}
                </Text>
              </Flex>
            </Button>
          </Flex>
        </Grid>{' '}
        <Divider variant="styles.hrVaultFormTop" sx={{ my: '13px', py: 0 }} />
        <Flex
          sx={{
            flexDirection: 'column',
            justifyContent: 'start',
          }}
        >
          <Box sx={{ py: '13px' }}>
            <Text
              sx={{
                color: 'text',
                overflowWrap: 'break-word',
                fontSize: 2,
                mb: '3px',
              }}
              variant="strong"
            >
              {t('ref.you-referred')}
            </Text>
            {userReferral.referrals &&
              userReferral.referrals.map((item, index) => (
                <Box key={index}>
                  {index > 0 && <Divider sx={{ my: 0, pt: '16px' }} />}
                  <Flex sx={{ flexWrap: 'wrap', alignItems: 'center' }} key={index}>
                    <Box sx={{ flex: '1 1 auto', pt: '16px' }}>
                      <Text
                        sx={{
                          color: 'neutral80',
                          overflowWrap: 'break-word',
                          fontSize: 2,
                          ml: ['0px', '8px'],
                          fontVariantLigatures: 'no-contextual',
                        }}
                      >
                        {item}{' '}
                      </Text>
                    </Box>
                    <Box sx={{ pt: '16px' }}>
                      <AppLink
                        href={`https://etherscan.com/address/${item}`}
                        sx={{
                          fontSize: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: '22px',
                        }}
                        variant="inText"
                      >
                        {t('ref.etherscan')}
                        <Icon
                          name="arrow_right"
                          size="12px"
                          sx={{
                            ml: 1,
                            position: 'relative',
                          }}
                        />
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
                        color: 'neutral80',
                        overflowWrap: 'break-word',
                        fontSize: 2,
                        ml: ['0px', '8px'],
                      }}
                    >
                      {t('ref.not-referred-yet')}
                    </Text>
                  </Box>
                  <Box>
                    <AppLink
                      href={`https://etherscan.com/address/#`}
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
          <Box sx={{ pt: '10px' }}>
            <Text
              sx={{
                color: 'text',
                overflowWrap: 'break-word',
                fontSize: 2,
              }}
              variant="strong"
            >
              {t('ref.referred-you')}
            </Text>

            <Flex sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 auto' }}>
                <Text
                  sx={{
                    color: 'neutral80',
                    overflowWrap: 'break-word',
                    fontSize: 2,
                    ml: ['0px', '8px'],
                    pt: '16px',
                    fontVariantLigatures: 'no-contextual',
                  }}
                >
                  {userReferral?.referrer && !userReferral.invitePending && userReferral.referrer}{' '}
                  {!userReferral?.referrer &&
                    !userReferral.invitePending &&
                    t(`ref.you-were-not-referred`)}
                  {userReferral?.referrer &&
                    userReferral.invitePending &&
                    `${t('ref.you-have-been-invited')} ${formatAddress(userReferral.referrer, 6)}`}
                </Text>
              </Box>
              <Box>
                {userReferral.state === 'currentUser' &&
                  !userReferral.invitePending &&
                  userReferral?.referrer && (
                    <>
                      <AppLink
                        href={`https://etherscan.com/address/${userReferral?.referrer}`}
                        sx={{
                          fontSize: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pt: '16px',
                          lineHeight: '22px',
                        }}
                        variant="inText"
                      >
                        {t('ref.etherscan')}
                        <Icon
                          name="arrow_right"
                          size="12px"
                          sx={{
                            ml: 1,
                            position: 'relative',
                          }}
                        />
                      </AppLink>
                    </>
                  )}
                {userReferral.state === 'currentUser' && userReferral.invitePending && (
                  <>
                    {' '}
                    <Flex sx={{ pt: '16px' }}>
                      <Text
                        sx={{
                          fontSize: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover svg': {
                            transform: 'translateX(10px)',
                          },
                          '&:hover': {
                            cursor: 'pointer',
                          },
                          color: 'interactive100',
                          mr: '12px',
                          ml: ['0px', '12px'],
                          lineHeight: '22px',
                        }}
                        onClick={() => createUser({ hasAccepted: true, isReferred: true })}
                      >
                        {t('ref.accept-invite')}
                        <Icon
                          name="arrow_right"
                          size="12px"
                          sx={{
                            ml: 1,
                            position: 'relative',
                            transition: '0.2s',
                          }}
                        />
                      </Text>
                      <Text color="neutral80" sx={{ lineHeight: '22px' }}>
                        |
                      </Text>
                      <Text
                        sx={{
                          fontSize: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover svg': {
                            transform: 'translateX(10px)',
                          },
                          '&:hover': {
                            cursor: 'pointer',
                          },
                          color: 'interactive100',
                          ml: '12px',
                          lineHeight: '22px',
                        }}
                        onClick={() => createUser({ hasAccepted: false, isReferred: false })}
                      >
                        {t('ref.reject-invite')}
                        <Icon
                          name="arrow_right"
                          size="12px"
                          sx={{
                            ml: 1,
                            position: 'relative',
                            transition: '0.2s',
                          }}
                        />
                      </Text>
                    </Flex>
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
