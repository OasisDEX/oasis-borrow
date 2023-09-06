import React from 'react'
import { Skeleton } from 'components/Skeleton'
import { Box } from 'theme-ui'

export const SwapWidgetSkeleton = () => (
  <Box sx={{ minWidth: '390px', pt: 5, px: 3 }}>
    <Skeleton count={5} gap={3} />
  </Box>
)
