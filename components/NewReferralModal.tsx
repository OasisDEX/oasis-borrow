import { Icon } from '@makerdao/dai-ui-icons'
import { UserReferralState } from 'features/referralOverview/user'
import { createUserUsingApi$ } from 'features/referralOverview/userApi'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { AppLink } from './Links'
import { Modal } from './Modal'
import { SuccessfulJoinModal } from './SuccessfullJoinModal'

interface ReferralProps {
  account?: string | null
  userReferral?: UserReferralState | null
}

interface UpsertUser {
  hasAccepted: boolean
  isReferred: boolean
}

export function NewReferralModal({ account, userReferral }: ReferralProps) {
  const { t } = useTranslation()
  const [success, setSuccess] = useState(false)
  const { push } = useRedirect()
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
          }
        })
    }
  }

  const ReferralModal = ({
    heading,
    topButtonText,
    bottomButtonText,
    topButtonFunc,
    bottomButtonFunc,
  }: {
    heading: string
    topButtonText: string
    bottomButtonText?: string
    topButtonFunc: () => void
    bottomButtonFunc?: () => void
  }) => (
    <Modal sx={{ maxWidth: '445px', margin: '0 auto' }} close={close}>
      <Grid p={4} sx={{ py: '24px' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
            <Image
              src={staticFilesRuntimeUrl('/static/img/referral.svg')}
              mb="16px"
              width="240px"
            />
          </Flex>
          <Heading as="h3" sx={{ mb: '12px', lineHeight: 1.5 }} variant="text.headerSettings">
            {heading}
          </Heading>
          <Text variant="paragraph3" sx={{ color: 'lavender', mb: '8px' }}>
            {t('ref.modal.body-text')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'lavender', my: '8px' }}>
            <Icon name="checkmark" size="auto" width="14px" color="primary" sx={{ mr: '8px' }} />{' '}
            <span style={{ fontWeight: 'bold', color: 'primary' }}> {t('ref.modal.p1_1')}</span>
            {t('ref.modal.p1_2')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'lavender', my: '8px' }}>
            <Icon name="checkmark" size="auto" width="14px" color="primary" sx={{ mr: '8px' }} />{' '}
            {t('ref.modal.p2')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'lavender', my: '8px' }}>
            <Icon name="checkmark" size="auto" width="14px" color="primary" sx={{ mr: '8px' }} />{' '}
            {t('ref.modal.p3')}
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
                boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.25)',
                '&:hover svg': {
                  transform: 'translateX(10px)',
                },
              }}
              onClick={topButtonFunc}
            >
              {topButtonText}
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
            {bottomButtonText && (
              <Button
                variant="textual"
                sx={{ fontSize: 3, width: '100%', mt: '12px', py: 0 }}
                onClick={bottomButtonFunc}
              >
                {bottomButtonText}
              </Button>
            )}
          </>
        </Flex>
      </Grid>
    </Modal>
  )

  return (
    <>
      {!success && !userReferral && (
        <ReferralModal
          heading="Welcome to the Oasis.app Referral Program"
          topButtonText={t('connect-wallet')}
          topButtonFunc={() => push('/connect')}
        />
      )}
      {!success && userReferral && userReferral.state === 'newUser' && (
        <ReferralModal
          heading="Welcome to the Oasis.app Referral Program"
          topButtonText={t('ref.modal.accept')}
          bottomButtonText={t('ref.modal.later')}
          topButtonFunc={() => createUser({ hasAccepted: true, isReferred: true })}
          bottomButtonFunc={() => createUser({ hasAccepted: false, isReferred: true })}
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
