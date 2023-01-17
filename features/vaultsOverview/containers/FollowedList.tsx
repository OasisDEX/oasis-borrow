import { DiscoverTable } from 'features/discover/common/DiscoverTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableHeading } from 'features/discover/common/DiscoverTableHeading'
import { DiscoverPages } from 'features/discover/types'
import React from 'react'

const rows = [
  {
    asset: 'WBTC',
    colRatio: { level: 301.7, isAtRiskDanger: false, isAtRiskWarning: false },
    vaultDebt: 61465632.43,
    collateralLocked: 493,
    variable: 0.1,
    cdpId: 29623,
  },
  {
    asset: 'ETH',
    colRatio: { level: 155.2, isAtRiskDanger: true, isAtRiskWarning: true },
    vaultDebt: 3498523,
    collateralLocked: 92438,
    variable: 0.4,
    cdpId: 29200,
  },
]

export function FollowedList() {
  return (
    <DiscoverTableContainer title="Following (4)">
      <DiscoverTableHeading>Oasis Borrow (2)</DiscoverTableHeading>
      <DiscoverTable
        // TODO: remove Discover kind dependency
        kind={DiscoverPages.LARGEST_DEBT}
        rows={rows}
      />
      <DiscoverTableHeading>Oasis Multiply (2)</DiscoverTableHeading>
      <DiscoverTable
        // TODO: remove Discover kind dependency
        kind={DiscoverPages.LARGEST_DEBT}
        rows={rows}
      />
      <DiscoverTableHeading>Oasis Earn (2)</DiscoverTableHeading>
      <DiscoverTable
        // TODO: remove Discover kind dependency
        kind={DiscoverPages.LARGEST_DEBT}
        rows={rows}
      />
    </DiscoverTableContainer>
  )
}
