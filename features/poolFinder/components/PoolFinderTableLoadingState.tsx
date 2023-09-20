import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { Skeleton } from 'components/Skeleton'
import type { FC } from 'react'
import React from 'react'
import { Box } from 'theme-ui'

export const PoolFinderTableLoadingState: FC = () => {
  return (
    <AssetsTableContainer>
      <Box sx={{ m: 4 }}>
        <Skeleton count={5} gap={4} />
      </Box>
    </AssetsTableContainer>
  )
}
