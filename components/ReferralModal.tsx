import { Icon } from '@makerdao/dai-ui-icons'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import { AppLink } from './Links'
import { Modal } from './Modal'

interface ReferralModaProps {
  heading: string
  topButton: { text: string; func: () => void }
  bottomButton?: { text: string; func: () => void }
}

export function ReferralModal({ heading, topButton, bottomButton }: ReferralModaProps) {
  const { t } = useTranslation()
  return (
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
          <Text variant="paragraph3" sx={{ color: 'neutral80', mb: '8px' }}>
            {t('ref.modal.body-text')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'neutral80', my: '8px' }}>
            <Icon name="checkmark" size="auto" width="14px" color="primary" sx={{ mr: '8px' }} />{' '}
            <span style={{ fontWeight: 'bold', color: 'primary' }}> {t('ref.modal.p1_1')}</span>
            {t('ref.modal.p1_2')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'neutral80', my: '8px' }}>
            <Icon name="checkmark" size="auto" width="14px" color="primary" sx={{ mr: '8px' }} />{' '}
            {t('ref.modal.p2')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'neutral80', my: '8px' }}>
            <Icon name="checkmark" size="auto" width="14px" color="primary" sx={{ mr: '8px' }} />{' '}
            {t('ref.modal.p3')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'neutral80', my: '12px' }}>
            {t('ref.modal.read')}{' '}
            <AppLink
              href="https://blog.oasis.app/oasis-app-referral-program-is-here/"
              target="_blank"
              sx={{ fontWeight: 'body' }}
            >
              {' '}
              {t('ref.modal.link-1')}
            </AppLink>
            <AppLink
              href="https://kb.oasis.app/help/a-step-by-step-guide-to-refer-a-friend"
              target="_blank"
              sx={{ fontWeight: 'body' }}
            >
              {' '}
              {t('ref.modal.link-2')}
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
              onClick={topButton.func}
            >
              {topButton.text}
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
            {bottomButton && (
              <Button
                variant="textual"
                sx={{ fontSize: 3, width: '100%', mt: '12px', py: 0 }}
                onClick={bottomButton.func}
              >
                {bottomButton.text}
              </Button>
            )}
          </>
        </Flex>
      </Grid>
    </Modal>
  )
}
