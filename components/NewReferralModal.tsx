import axios from 'axios'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import { ModalProps } from '../helpers/modalHook'
import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
import { Modal, ModalCloseIcon } from './Modal'

interface NewReferralProps {
  referrer: string | null | undefined
  address: string
}
export function NewReferralModal({ close, referrer, address }: ModalProps<NewReferralProps>) {
  const { t } = useTranslation()
  // TODO pipe
  const createUser = async (accept: boolean) => {
    await axios.post(`/api/user/create`, {
      user_that_referred_address: accept ? referrer : '0x000000000000000000000000000000000000dead',
      address: address,
    })

    close()
  }

  return (
    <Modal close={close} sx={{ maxWidth: '445px', margin: '0 auto' }}>
      <ModalCloseIcon {...{ close }} />
      <Grid p={4}>
        <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
          <Image src={staticFilesRuntimeUrl('/static/img/referral.svg')} my="16px" />
          <Heading as="h3" sx={{ textAlign: 'center', mb: 4, fontSize: 5 }} variant="strong">
            {t('ref.modal.you-have-been-ref')} {referrer?.slice(0, 10)}...{referrer?.slice(-11)}
          </Heading>
          <Text variant="paragraph3" sx={{ color: 'lavender', textAlign: 'center', mb: '16px' }}>
            {t('ref.modal.body-text')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'lavender', textAlign: 'center' }}>
            {t('ref.modal.p1')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'lavender', textAlign: 'center' }}>
            {t('ref.modal.p2')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'lavender', textAlign: 'center' }}>
            {t('ref.modal.p3')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'lavender', textAlign: 'center', mb: '18px' }}>
            {t('ref.modal.p4')}
          </Text>

          <>
            <Button
              variant="primary"
              sx={{ fontSize: 3, width: '100%', py: '10px', my: '6px' }}
              onClick={() => createUser(true)}
            >
              {t('ref.modal.accept')}
            </Button>
            <Button
              variant="outline"
              sx={{ fontSize: 3, width: '100%', py: '14px', my: '6px' }}
              onClick={() => createUser(false)}
            >
              {t('ref.modal.dont-earn')}
            </Button>
          </>
        </Flex>
      </Grid>
    </Modal>
  )
}
