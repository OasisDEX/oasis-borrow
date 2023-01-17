import { DiscoverTable } from 'features/discover/common/DiscoverTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableHeading } from 'features/discover/common/DiscoverTableHeading'
import { DiscoverPages } from 'features/discover/types'
import React from 'react'

export function FollowedList() {
  return (
    <DiscoverTableContainer title="Following (4)">
      <DiscoverTableHeading>Oasis Borrow (2)</DiscoverTableHeading>
      <DiscoverTable
        // isLoading={isLoading}
        // TODO: remove Discover kind dependency
        kind={DiscoverPages.LARGEST_DEBT}
        rows={[
          {
            id: '10',
          },
          {
            id: '10',
          },
          {
            id: '10',
          },
        ]}
      />
    </DiscoverTableContainer>
  )
}
