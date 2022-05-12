import { Icon } from '@makerdao/dai-ui-icons'
// import axios from 'axios'
import { createUserUsingApi$ } from 'features/referralOverview/userApi'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { useObservable } from 'helpers/observableHook'
// import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import { ModalProps } from '../helpers/modalHook'
import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { useAppContext } from './AppContextProvider'
import { Modal } from './Modal'

interface NewReferralProps {
  referrer: string | null | undefined
  address: string | undefined
}

interface UpsertUser {
  hasAccepted: boolean
  isReferred: boolean
}

export function NewReferralModal({ close, address }: ModalProps<NewReferralProps>) {
  const { t } = useTranslation()
  //const { replace } = useRedirect()
  const { userReferral$ } = useAppContext()
  const [userReferral] = useObservable(userReferral$)

  // TODO pipe

  const createUser = async (upsertUser: UpsertUser) => {
    const { hasAccepted, isReferred } = upsertUser

    if (userReferral && address) {
      const jwtToken = jwtAuthGetToken(address)
      if (jwtToken)
        createUserUsingApi$(
          hasAccepted,
          isReferred ? userReferral.referrer.referrer : null,
          address,
          jwtToken,
        ).subscribe((res) => {
          res[0] === 'OK' ? close() : null
        })
    }
  }

  return (
    <>
      {userReferral && (
        <Modal close={close} sx={{ maxWidth: '445px', margin: '0 auto' }}>
          <Grid p={4} sx={{ pb: '14px' }}>
            <Flex sx={{ flexDirection: 'column' }}>
              <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
                <Image
                  src={staticFilesRuntimeUrl('/static/img/referral.svg')}
                  mb="16px"
                  width="240px"
                />
              </Flex>
              <Heading as="h3" sx={{ textAlign: 'center', mb: 4, fontSize: 5 }} variant="strong">
                {userReferral.referrer.referrer
                  ? ` ${t('ref.modal.you-have-been-ref')} ${userReferral.referrer.referrer?.slice(
                      0,
                      10,
                    )}...${userReferral.referrer.referrer?.slice(-11)}`
                  : 'Welcome to the Oasis.app Referral Program'}
              </Heading>
              <Text
                variant="paragraph3"
                sx={{ color: 'lavender', textAlign: 'center', mb: '16px' }}
              >
                {t('ref.modal.body-text')}
              </Text>
              <Text variant="paragraph3" sx={{ color: 'lavender', my: '8px' }}>
                <Icon name="checkmark" size="auto" width="12px" />{' '}
                <span style={{ fontWeight: 'bold' }}> {t('ref.modal.p1_1')}</span>
                {t('ref.modal.p1_2')}
              </Text>
              <Text variant="paragraph3" sx={{ color: 'lavender', my: '8px' }}>
                <Icon name="checkmark" size="auto" width="12px" /> {t('ref.modal.p2')}
              </Text>
              <Text variant="paragraph3" sx={{ color: 'lavender', my: '8px' }}>
                <Icon name="checkmark" size="auto" width="12px" /> {t('ref.modal.p3')}
              </Text>
              <Text variant="paragraph3" sx={{ color: 'lavender', my: '11px' }}>
                {t('ref.modal.read')}
              </Text>
              <>
                <Button
                  variant="primary"
                  sx={{ fontSize: 3, width: '100%', py: '10px', my: '6px' }}
                  onClick={
                    userReferral.referrer.referrer
                      ? () => createUser({ hasAccepted: true, isReferred: true })
                      : () => createUser({ hasAccepted: true, isReferred: false })
                  }
                >
                  {userReferral.referrer.referrer ? t('ref.modal.accept') : 'Go to dashboard ->'}
                </Button>
                <Button
                  variant="textual"
                  sx={{ fontSize: 3, width: '100%', mt: '6px' }}
                  onClick={
                    userReferral.referrer.referrer
                      ? () => createUser({ hasAccepted: false, isReferred: true })
                      : () => createUser({ hasAccepted: false, isReferred: false })
                  }
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
