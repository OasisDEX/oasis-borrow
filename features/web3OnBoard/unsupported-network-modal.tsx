import { Modal } from 'components/Modal'
import type { ModalProps } from 'helpers/modalHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Grid, Heading, Image, Text } from 'theme-ui'

export function UnsupportedNetworkModal({
  switchNetwork,
}: ModalProps<{
  switchNetwork: () => Promise<void>
}>) {
  const { t } = useTranslation()

  return (
    <Modal sx={{ maxWidth: '445px', margin: '0 auto' }}>
      <Grid p={4}>
        <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
          <Image src={staticFilesRuntimeUrl('/static/img/switch_wallet.svg')} my="50px" />
          <Heading as="h2" sx={{ textAlign: 'center', mb: 2, fontSize: 5 }}>
            {t('wallet-wrong-network')}
          </Heading>
          <Text variant="paragraph3" sx={{ textAlign: 'center', mb: '24px' }}>
            {t('wallet-wrong-network-desc')}
          </Text>
          <Button variant="primary" sx={{ fontSize: 3, width: '100%' }} onClick={switchNetwork}>
            {t('switch-network')}
          </Button>
        </Flex>
      </Grid>
    </Modal>
  )
}
