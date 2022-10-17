import { AppSpinner } from 'helpers/AppSpinner'
import React from 'react'

export function DiscoveryPreloader({ isContentLoaded }: { isContentLoaded: boolean }) {
  return (
    <AppSpinner
      sx={{
        mx: 'auto',
        ...(isContentLoaded
          ? {
              position: 'absolute',
              top: '80px',
              right: 0,
              left: 0,
              my: 'auto',
            }
          : {
              mb: ['24px', null, null, 4],
            }),
      }}
      variant="extraLarge"
    />
  )
}
