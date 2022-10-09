import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box } from 'theme-ui'

export function DiscoveryTableCellText({ children }: WithChildren) {
  return (
    <Box
      as="td"
      sx={{
        p: '8px 12px',
        textAlign: 'right',
        '&:first-child': {
          textAlign: 'left',
        },
      }}
    >
      {children}
    </Box>
  )
}
