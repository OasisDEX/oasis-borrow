import { useAppContext } from 'components/AppContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { DiscoverError } from 'features/discover/common/DiscoverError'
import { DiscoverPreloader } from 'features/discover/common/DiscoverPreloader'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableHeading } from 'features/discover/common/DiscoverTableHeading'
import { getMakerBorrowPositions, getMakerMultiplyPositions } from 'features/vaultsOverview/helpers'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

const rows = [
  {
    asset: 'WBTC',
    // colRatio: { level: 301.7, isAtRiskDanger: false, isAtRiskWarning: false },
    vaultDebt: 61465632.43,
    collateralLocked: 493,
    variable: 0.1,
    cdpId: 29623,
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
            const borrowVaults = getMakerBorrowPositions(followedList)
            const makerVaults = getMakerMultiplyPositions(followedList)

            return followedList.length ? (
              <>
                {borrowVaults.length && (
                  <>
                    <DiscoverTableHeading>
                      Oasis Borrow ({borrowVaults.length})
                    </DiscoverTableHeading>
                    <DiscoverResponsiveTable rows={borrowVaults} skip={['ilk', 'isOwner']} />
                  </>
                )}
                {makerVaults.length && (
                  <>
                    <DiscoverTableHeading>
                      Oasis Multiply ({makerVaults.length})
                    </DiscoverTableHeading>
                    <DiscoverResponsiveTable rows={makerVaults} skip={['ilk', 'isOwner']} />
                  </>
                )}
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
