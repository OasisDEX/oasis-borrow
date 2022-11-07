import { AppSpinner } from 'helpers/AppSpinner'
import React from 'react'

export function DiscoverPreloader({ isContentLoaded }: { isContentLoaded: boolean }) {
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
              my: ['24px', null, null, 4],
            }),
      }}
      variant="extraLarge"
    />
  )
}
