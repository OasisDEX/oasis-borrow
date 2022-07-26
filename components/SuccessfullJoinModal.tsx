import { Icon } from '@makerdao/dai-ui-icons'
import { UserReferralState } from 'features/referralOverview/user'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { AppLink } from './Links'
import { Modal } from './Modal'

interface NewReferralProps {
  account: string | undefined
  userReferral: UserReferralState
  heading: string
}

export function SuccessfulJoinModal({ account, userReferral, heading }: NewReferralProps) {
  const { t } = useTranslation()
  const { replace } = useRedirect()
  return (
    <>
      {userReferral && (
        <Modal sx={{ maxWidth: '445px', margin: '0 auto' }} close={() => null}>
          <Grid p={4} sx={{ py: '24px' }}>
            <Flex sx={{ flexDirection: 'column' }}>
              <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
                <Image
                  src={staticFilesRuntimeUrl('/static/img/referral_success.svg')}
                  mb="24px"
                  width="240px"
                />
              </Flex>

              <Heading as="h3" sx={{ mb: '12px', lineHeight: 1.5 }} variant="text.headerSettings">
                {heading}
              </Heading>
              <Text variant="paragraph3" sx={{ color: 'neutral80', mb: '8px' }}>
                {t('ref.modal.joined-body')}
              </Text>
              <>
                <AppLink href="/">
                  <Button
                    variant="primary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 3,
                      width: '100%',
                      py: '10px',
                      my: '12px',
                      '&:hover svg': {
                        transform: 'translateX(10px)',
                      },
                      boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {t('ref.modal.go-home')}
                    <Icon key="arrow" name="arrow_right" sx={{ transition: '0.2s', ml: '4px' }} />
                  </Button>
                </AppLink>

                <Button
                  variant="textual"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 2,
                    width: '100%',
                    mt: '12px',
                    py: 0,
                    '&:hover svg': {
                      transform: 'translateX(10px)',
                    },
                  }}
                  onClick={() => {
                    userReferral.trigger()
                    replace(`/referrals/${account}`)
                  }}
                >
                  {t('ref.modal.go-dashboard')}
                  <Icon key="arrow" name="arrow_right" sx={{ transition: '0.2s', ml: '4px' }} />
                </Button>
              </>
            </Flex>
          </Grid>
        </Modal>
      )}{' '}
    </>
  )
}
