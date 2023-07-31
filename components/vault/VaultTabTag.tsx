import { Box } from '@theme-ui/components'
import { AppSpinner } from 'helpers/AppSpinner'
import React from 'react'

interface VaultTabTagProps {
  isEnabled?: boolean
  isLoading?: boolean
}

export function VaultTabTag({ isEnabled, isLoading }: VaultTabTagProps) {
  return (
    <Box
      sx={{
        height: '19px',
        lineHeight: '19px',
        borderRadius: '5px',
        backgroundColor: !isLoading ? (isEnabled ? 'success100' : 'warning100') : 'neutral70',
        color: 'white',
        fontSize: 1,
        fontWeight: 'semiBold',
        px: 2,
        ml: 2,
      }}
    >
      {!isLoading ? (
        isEnabled ? (
          'ON'
        ) : (
          'OFF'
        )
      ) : (
        <AppSpinner size={15} sx={{ color: 'white', pt: '3px' }} />
      )}
    </Box>
  )
}
