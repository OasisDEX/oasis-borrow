import { useModalContext } from 'helpers/modalHook'
import React from 'react'
import { Box, Button } from 'theme-ui'

import type { RefinanceControllerProps } from './RefinanceController'
import { RefinanceModal } from './RefinanceModal'

// placeholder for banner that will open modal
export const RefinanceBanner: React.FC<RefinanceControllerProps> = ({
  address,
  chainId: networkId,
}) => {
  const { openModal } = useModalContext()

  return (
    <Button
      variant="bean"
      sx={{ fontSize: 2 }}
      onClick={() => openModal(RefinanceModal, { address, chainId: networkId })}
    >
      <Box sx={{ width: '100%' }}>Refinance POC 👷‍♂️</Box>
    </Button>
  )
}
