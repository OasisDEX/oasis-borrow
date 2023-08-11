import { Skeleton } from 'components/Skeleton'
import React, { FC } from 'react'
import { Box } from 'theme-ui'

export const PoolFinderFormLoadingState: FC = () => {
  return (
    <Box sx={{ maxWidth: '804px', mx: 'auto' }}>
      <Skeleton height="96px" radius="circle" />
    </Box>
  )
}
