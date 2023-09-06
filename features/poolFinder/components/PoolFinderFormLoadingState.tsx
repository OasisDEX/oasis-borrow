import React, { FC } from 'react'
import { Skeleton } from 'components/Skeleton'
import { Box } from 'theme-ui'

export const PoolFinderFormLoadingState: FC = () => {
  return (
    <Box sx={{ maxWidth: '804px', mx: 'auto' }}>
      <Skeleton height="98px" radius="circle" />
    </Box>
  )
}
