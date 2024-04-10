import { RefinanceModal } from 'features/refinance/components'
import { useModalContext } from 'helpers/modalHook'
import React from 'react'
import { Box, Button } from 'theme-ui'

export const RefinanceBanner: React.FC<{}> = () => {
  const { openModal } = useModalContext()

  return (
    <Button variant="bean" sx={{ fontSize: 2 }} onClick={() => openModal(RefinanceModal, {})}>
      <Box sx={{ width: '100%' }}>Get Started</Box>
    </Button>
  )
}
