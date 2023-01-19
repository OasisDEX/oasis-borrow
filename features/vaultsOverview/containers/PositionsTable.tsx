import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { getAddress } from 'ethers/lib/utils'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableHeading } from 'features/discover/common/DiscoverTableHeading'
import { PositionTableEmptyState } from 'features/vaultsOverview/components/PositionTableEmptyState'
import { PositionTableLoadingState } from 'features/vaultsOverview/components/PositionTableLoadingState'
import {
  getMakerBorrowPositions,
  positionsTableSkippedHeaders,
  positionsTableTooltips,
} from 'features/vaultsOverview/helpers'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAddress } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

export function PositionsTable({ address }: { address: string }) {
  const { t } = useTranslation()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const { ownersPositionsList$ } = useAppContext()
  const { walletAddress } = useAccount()
  const [ownersPositionsListData, ownersPositionsListError] = useObservable(
    ownersPositionsList$(checksumAddress),
  )

  const isOwner = address === walletAddress

  return (
    <WithErrorHandler error={[ownersPositionsListError]}>
      <WithLoadingIndicator
        value={[ownersPositionsListData]}
        customLoader={<PositionTableLoadingState />}
      >
        {([ownersPositionsList]) => {
          const combinedPositionsData = [
            ...ownersPositionsList.makerPositions,
            ...ownersPositionsList.aavePositions,
          ]
          const borrowPositions = getMakerBorrowPositions(ownersPositionsList.makerPositions)
          // const makerPositions = getMakerMultiplyPositions(followedList)
          // const earnPositions = getMakerEarnPositions(followedList)

          return combinedPositionsData.length ? (
            <DiscoverTableContainer
              title={`${t(`vaults-overview.${isOwner ? 'owner' : 'non-owner'}-positions`, {
                address: formatAddress(address),
              })} (${combinedPositionsData.length})`}
            >
              {borrowPositions.length > 0 && (
                <>
                  <DiscoverTableHeading>
                    Oasis {t('nav.borrow')} ({borrowPositions.length})
                  </DiscoverTableHeading>
                  <DiscoverResponsiveTable
                    rows={borrowPositions}
                    skip={positionsTableSkippedHeaders}
                    tooltips={positionsTableTooltips}
                  />
                </>
              )}
              {/* {makerPositions.length > 0 && (
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
              {earnPositions.length > 0 && (
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
              )} */}
            </DiscoverTableContainer>
          ) : (
            <PositionTableEmptyState
              title={`${t(`vaults-overview.${isOwner ? 'owner' : 'non-owner'}-positions`, {
                address: formatAddress(address),
              })}`}
              header={t(`vaults-overview.no-positions-header-${isOwner ? 'owner' : 'non-owner'}`, {
                address: formatAddress(address),
              })}
              content={
                <Trans
                  i18nKey="vaults-overview.no-positions-content"
                  components={[
                    <AppLink href="/multiply" sx={{ fontWeight: 'regular', fontSize: 3 }} />,
                    <AppLink href="/earn" sx={{ fontWeight: 'regular', fontSize: 3 }} />,
                    <AppLink href="/borrow" sx={{ fontWeight: 'regular', fontSize: 3 }} />,
                  ]}
                />
              }
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
