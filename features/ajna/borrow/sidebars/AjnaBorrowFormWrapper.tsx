import { AjnaBorrowFormContent } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContent'
import { AjnaBorrowFormDpm } from 'features/ajna/borrow/sidebars/AjnaBorrowFormDpm'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'
import { Box } from 'theme-ui'

export function AjnaBorrowFormWrapper() {
  const {
    steps: { isExternalStep },
  } = useAjnaBorrowContext()

  return (
    <Box>
      {!isExternalStep && <AjnaBorrowFormContent />}
      <AjnaBorrowFormDpm />
    </Box>
  )
}
