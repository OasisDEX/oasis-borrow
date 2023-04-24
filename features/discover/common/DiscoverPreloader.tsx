import { AppSpinner } from 'helpers/AppSpinner'
import React from 'react'
import { Box } from 'theme-ui'

export function DiscoverPreloader({ isContentLoaded = false }: { isContentLoaded?: boolean }) {
  return (
    <Box sx={{ position: 'sticky', top: '120px', zIndex: 1 }}>
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
    </Box>
  )
}
