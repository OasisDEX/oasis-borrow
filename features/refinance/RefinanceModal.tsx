import { Modal } from 'components/Modal'
import type { ModalProps } from 'helpers/modalHook'
import React from 'react'
import { Box, Text } from 'theme-ui'

import { RefinanceController, type RefinanceControllerProps } from './RefinanceController'

export function RefinanceModal({
  close: _close,
  address,
  chainId: networkId,
}: ModalProps<RefinanceControllerProps>) {
  return (
    <Modal close={_close} sx={{ maxWidth: '570px', margin: '0 auto' }}>
      <Box sx={{ p: 3 }}>
        <Text as="h2">Refinance</Text>
      </Box>
      <RefinanceController address={address} chainId={networkId} />
    </Modal>
  )
}
