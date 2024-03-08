import { Modal } from 'components/Modal'
import type { ModalProps } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Grid, Heading, Text } from 'theme-ui'

export function LackOfFlashloanLiquidityModal({
  close,
}: ModalProps<{
  close: () => void
}>) {
  const { t } = useTranslation()

  return (
    <Modal sx={{ maxWidth: '445px', margin: '0 auto' }}>
      <Grid p={4}>
        <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
          <Heading as="h2" sx={{ textAlign: 'center', mb: 2, fontSize: 5 }}>
            {t('migrate.flashloan-modal.heading')}
          </Heading>
          <Text variant="paragraph3" sx={{ textAlign: 'center', mb: '24px' }}>
            {t('migrate.flashloan-modal.description')}
          </Text>
          <Button variant="primary" sx={{ fontSize: 3, width: '100%' }} onClick={close}>
            {t('close')}
          </Button>
        </Flex>
      </Grid>
    </Modal>
  )
}
