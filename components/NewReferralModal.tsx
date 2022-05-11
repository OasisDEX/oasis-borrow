import { Icon } from '@makerdao/dai-ui-icons'
import axios from 'axios'
import { useRedirect } from 'helpers/useRedirect'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import { ModalProps } from '../helpers/modalHook'
import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { Modal } from './Modal'

interface NewReferralProps {
  referrer: string | null | undefined
  address: string | undefined
}
export function NewReferralModal({ close, referrer, address }: ModalProps<NewReferralProps>) {
  const { t } = useTranslation()
  const { replace } = useRedirect()
  // TODO pipe
  const createUser = async (accept: boolean, referred: boolean) => {
    const res = await axios.post(`/api/user/create`, {
      user_that_referred_address: referred
        ? referrer
        : null,
      address: address,
      accepted: accept,
    })
    if (res.status === 200) {
      replace(`/referrals/${address}`)
      close()
    }
  }

  return (
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
            {referrer
              ? ` ${t('ref.modal.you-have-been-ref')} ${referrer?.slice(0, 10)}...${referrer?.slice(
                  -11,
                )}`
              : 'Welcome to the Oasis.app Referral Program'}
          </Heading>
          <Text variant="paragraph3" sx={{ color: 'lavender', textAlign: 'center', mb: '16px' }}>
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
              onClick={referrer ? () => createUser(true, true) : () => createUser(true, false)}
            >
              {referrer ? t('ref.modal.accept') : 'Go to dashboard ->'}
            </Button>
            <Button
              variant="textual"
              sx={{ fontSize: 3, width: '100%', mt: '6px' }}
              onClick={referrer ? () => createUser(false, true) : () => createUser(false, false)}
            >
              {referrer ? t('ref.modal.later') : "I'll check later"}
            </Button>
          </>
        </Flex>
      </Grid>
    </Modal>
  )
}
