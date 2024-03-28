import { Modal } from 'components/Modal'
import type { ModalProps } from 'helpers/modalHook'
import React from 'react'
import { Box, Text } from 'theme-ui'

import { RefinanceController } from './RefinanceController'

export function RefinanceModal({ close: _close }: ModalProps<{}>) {
  return (
    <Modal close={_close} sx={{ maxWidth: '570px', margin: '0 auto' }}>
      <Box sx={{ p: 3 }}>
        <Text as="h2">Refinance</Text>
      </Box>
      <RefinanceController />
    </Modal>
  )
}
