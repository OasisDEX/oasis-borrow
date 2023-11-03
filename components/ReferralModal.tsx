import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { arrow_right, checkmark } from 'theme/icons'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

import { Icon } from './Icon'
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
          <Heading as="h4" sx={{ mb: '12px', lineHeight: 1.5 }} variant="header4">
            {heading}
          </Heading>
          <Text variant="paragraph3" sx={{ color: 'neutral80', mb: '8px' }}>
            {t('ref.modal.body-text')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'neutral80', my: '8px' }}>
            <Icon icon={checkmark} size="auto" width="14px" color="primary" sx={{ mr: '8px' }} />{' '}
            <span style={{ fontWeight: 'bold', color: 'primary' }}> {t('ref.modal.p1_1')}</span>
            {t('ref.modal.p1_2')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'neutral80', my: '8px' }}>
            <Icon icon={checkmark} size="auto" width="14px" color="primary" sx={{ mr: '8px' }} />{' '}
            {t('ref.modal.p2')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'neutral80', my: '8px' }}>
            <Icon icon={checkmark} size="auto" width="14px" color="primary" sx={{ mr: '8px' }} />{' '}
            {t('ref.modal.p3')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'neutral80', my: '12px' }}>
            {t('ref.modal.read')}{' '}
            <AppLink
              href={EXTERNAL_LINKS.BLOG.REFERAL_PROGRAM_INFO}
              target="_blank"
              sx={{ fontWeight: 'body' }}
            >
              {' '}
              {t('ref.modal.link-1')}
            </AppLink>
            <AppLink
              href={EXTERNAL_LINKS.KB.REFER_A_FRIEND}
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
                icon={arrow_right}
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
