import { Box } from '@theme-ui/components'
import React from 'react'

interface VaultTabTagProps {
  isEnabled?: boolean
}

export function VaultTabTag({ isEnabled }: VaultTabTagProps) {
  return (
    <Box
      sx={{
        height: '19px',
        lineHeight: '19px',
        borderRadius: '5px',
        backgroundColor: isEnabled ? 'success100' : 'warning100',
        color: 'white',
        fontSize: 1,
        fontWeight: 'semiBold',
        px: 2,
        ml: 2,
      }}
    >
      {isEnabled ? 'ON' : 'OFF'}
    </Box>
  )
}
