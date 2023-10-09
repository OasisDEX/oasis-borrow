import { NetworkHexIds } from 'blockchain/networks'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useModalContext } from 'helpers/modalHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { Button, Flex, Grid, Image, Text } from 'theme-ui'

export function ReferralClaimSwitchNetworkModal() {
  const { t } = useTranslation()
  const { setChain } = useConnection()
  const { closeModal } = useModalContext()

  const switchToOptimism = useCallback(() => {
    setChain(NetworkHexIds.OPTIMISMMAINNET)
  }, [setChain])

  return (
    <Modal sx={{ maxWidth: '445px', margin: '0 auto' }} close={closeModal}>
      <Grid p={4} sx={{ mt: '32px' }}>
        <ModalCloseIcon close={closeModal} />
        <Flex sx={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Image src={staticFilesRuntimeUrl('/static/img/switch_wallet_optimism.svg')} mb="16px" />
          <Text mb="8px" sx={{ lineHeight: 1.5 }} variant="header4">
            {t('ref.modal.switch-network-heading')}
          </Text>
          <Text variant="paragraph3" mb="32px" sx={{ color: 'neutral80' }}>
            {t('ref.modal.switch-network-p1')}
          </Text>
          <Button
            variant="primary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 3,
              width: '100%',
            }}
            onClick={switchToOptimism}
          >
            {t('ref.modal.switch-network-button-text')}
          </Button>
        </Flex>
      </Grid>
    </Modal>
  )
}
