import { Skeleton } from 'components/Skeleton'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import React from 'react'

export function PositionTableLoadingState() {
  return (
    <DiscoverTableContainer padded>
      <Skeleton width="150px" count={2} />
      <Skeleton height="175px" sx={{ mt: 4 }} />
    </DiscoverTableContainer>
  )
}
