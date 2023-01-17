import { useAppContext } from 'components/AppContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { DiscoverError } from 'features/discover/common/DiscoverError'
import { DiscoverPreloader } from 'features/discover/common/DiscoverPreloader'
import { DiscoverTable } from 'features/discover/common/DiscoverTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableHeading } from 'features/discover/common/DiscoverTableHeading'
import { DiscoverPages } from 'features/discover/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
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

export function FollowedList({ address }: { address: string }) {
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const { followedList$ } = useAppContext()
  const [followedListData, followedListError] = useObservable(followedList$(checksumAddress))

  return (
    <DiscoverTableContainer
      title={`Following${followedListData ? ` (${followedListData.length})` : ''}`}
    >
      <WithErrorHandler error={[followedListError]}>
        <WithLoadingIndicator value={[followedListData]} customLoader={<DiscoverPreloader />}>
          {([followedList]) => {
            return followedList.length ? (
              <>
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
              </>
            ) : (
              <DiscoverError message="You aren not following any vaults" />
            )
          }}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </DiscoverTableContainer>
  )
}
