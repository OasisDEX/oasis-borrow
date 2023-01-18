import { useAppContext } from 'components/AppContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { DiscoverError } from 'features/discover/common/DiscoverError'
import { DiscoverPreloader } from 'features/discover/common/DiscoverPreloader'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableHeading } from 'features/discover/common/DiscoverTableHeading'
import {
  followTableSkippedHeaders,
  getMakerBorrowPositions,
  getMakerEarnPositions,
  getMakerMultiplyPositions,
  positionsTableTooltips,
} from 'features/vaultsOverview/helpers'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function FollowedList({ address }: { address: string }) {
  const { t } = useTranslation()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const { followedList$ } = useAppContext()
  const [followedListData, followedListError] = useObservable(followedList$(checksumAddress))

  return (
    <DiscoverTableContainer
      title={`${t('following')}${followedListData ? ` (${followedListData.length})` : ''}`}
    >
      <WithErrorHandler error={[followedListError]}>
        <WithLoadingIndicator value={[followedListData]} customLoader={<DiscoverPreloader />}>
          {([followedList]) => {
            const borrowPositions = getMakerBorrowPositions(followedList)
            const makerPositions = getMakerMultiplyPositions(followedList)
            const earnPositions = getMakerEarnPositions(followedList)

            return followedList.length ? (
              <>
                {borrowPositions.length && (
                  <>
                    <DiscoverTableHeading>
                      Oasis {t('nav.borrow')} ({borrowPositions.length})
                    </DiscoverTableHeading>
                    <DiscoverResponsiveTable
                      rows={borrowPositions}
                      skip={followTableSkippedHeaders}
                      tooltips={positionsTableTooltips}
                    />
                  </>
                )}
                {makerPositions.length && (
                  <>
                    <DiscoverTableHeading>
                      Oasis {t('nav.multiply')} ({makerPositions.length})
                    </DiscoverTableHeading>
                    <DiscoverResponsiveTable
                      rows={makerPositions}
                      skip={followTableSkippedHeaders}
                      tooltips={positionsTableTooltips}
                    />
                  </>
                )}
                {earnPositions.length && (
                  <>
                    <DiscoverTableHeading>
                      Oasis {t('nav.earn')} ({earnPositions.length})
                    </DiscoverTableHeading>
                    <DiscoverResponsiveTable
                      rows={earnPositions}
                      skip={followTableSkippedHeaders}
                      tooltips={positionsTableTooltips}
                    />
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
