import { Icon } from '@makerdao/dai-ui-icons'
import { createUserUsingApi$ } from 'features/referralOverview/userApi'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { AppLink } from './Links'
import { Modal } from './Modal'

interface NewReferralProps {
  account: string | undefined
  userReferral: any
}

interface UpsertUser {
  hasAccepted: boolean
  isReferred: boolean
}

export function NewReferralModal({ account, userReferral }: NewReferralProps) {
  const { t } = useTranslation()

  // TODO pipe

  const createUser = async (upsertUser: UpsertUser) => {
    const { hasAccepted, isReferred } = upsertUser

    if (userReferral && account) {
      const jwtToken = jwtAuthGetToken(account)
      if (jwtToken)
        createUserUsingApi$(
          hasAccepted,
          isReferred ? userReferral.referrer.referrer : null,
          account,
          jwtToken,
        ).subscribe((res) => {
          if (res === 200) {
            userReferral.trigger && userReferral.trigger()
          }
        })
    }
  }

  return (
    <>
      {userReferral && userReferral.state === 'newUser' && (
        <Modal sx={{ maxWidth: '445px', margin: '0 auto' }} close={() => null}>
          <Grid p={4} sx={{ py: '24px' }}>
            <Flex sx={{ flexDirection: 'column' }}>
              <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
                <Image
                  src={staticFilesRuntimeUrl('/static/img/referral.svg')}
                  mb="16px"
                  width="240px"
                />
              </Flex>
              <Heading as="h3" sx={{ mb: '12px' }} variant="text.headerSettings">
                {userReferral.referrer.referrer
                  ? ` ${t('ref.modal.you-have-been-ref')} ${userReferral.referrer.referrer?.slice(
                      0,
                      4,
                    )}...${userReferral.referrer.referrer?.slice(-5)}`
                  : 'Welcome to the Oasis.app Referral Program'}
              </Heading>
              <Text variant="paragraph3" sx={{ color: 'lavender', mb: '8px' }}>
                {t('ref.modal.body-text')}
              </Text>
              <Text variant="paragraph3" sx={{ color: 'lavender', my: '8px' }}>
                <Icon name="checkmark" size="auto" width="14px" color="black" />{' '}
                <span style={{ fontWeight: 'bold', color: 'black' }}> {t('ref.modal.p1_1')}</span>
                {t('ref.modal.p1_2')}
              </Text>
              <Text variant="paragraph3" sx={{ color: 'lavender', my: '8px' }}>
                <Icon name="checkmark" size="auto" width="14px" color="black" /> {t('ref.modal.p2')}
              </Text>
              <Text variant="paragraph3" sx={{ color: 'lavender', my: '8px' }}>
                <Icon name="checkmark" size="auto" width="14px" color="black" /> {t('ref.modal.p3')}
              </Text>
              <Text variant="paragraph3" sx={{ color: 'lavender', my: '12px' }}>
                {t('ref.modal.read')}{' '}
                <AppLink href="#" sx={{ fontWeight: 'body' }}>
                  {' '}
                  {t('ref.modal.link')}
                </AppLink>
              </Text>
              <>
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
                  }}
                  onClick={() => createUser({ hasAccepted: true, isReferred: true })}
                >
                  {userReferral.referrer.referrer ? t('ref.modal.accept') : 'Go to dashboard'}{' '}
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
                <Button
                  variant="textual"
                  sx={{ fontSize: 3, width: '100%', mt: '12px', py: 0 }}
                  onClick={() => createUser({ hasAccepted: false, isReferred: true })}
                >
                  {userReferral.referrer.referrer ? t('ref.modal.later') : "I'll check later"}
                </Button>
              </>
            </Flex>
          </Grid>
        </Modal>
      )}{' '}
    </>
  )
}
