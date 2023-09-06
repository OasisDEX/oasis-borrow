import React from 'react'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { Skeleton } from 'components/Skeleton'

export function PositionTableLoadingState() {
  return (
    <AssetsTableContainer padded>
      <Skeleton width="150px" count={2} />
      <Skeleton height="175px" sx={{ mt: 4 }} />
    </AssetsTableContainer>
  )
}
