import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableHeading } from 'components/assetsTable/AssetsTableHeading'
import { useProductContext } from 'components/context/ProductContextProvider'
import { AppLink } from 'components/Links'
import { getAddress } from 'ethers/lib/utils'
import { PositionTableEmptyState } from 'features/vaultsOverview/components/PositionTableEmptyState'
import { PositionTableLoadingState } from 'features/vaultsOverview/components/PositionTableLoadingState'
import { positionsTableTooltips } from 'features/vaultsOverview/helpers'
import {
  getBorrowPositionRows,
  getEarnPositionRows,
  getMultiplyPositionRows,
  parseMakerBorrowPositionRows,
  parseMakerEarnPositionRows,
  parseMakerMultiplyPositionRows,
} from 'features/vaultsOverview/parsers'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAddress } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

export function FollowedTable({ address }: { address: string }) {
  const { t } = useTranslation()
  const { followedList$ } = useProductContext()
  const { walletAddress } = useAccount()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [followedListData, followedListError] = useObservable(followedList$(checksumAddress))

  const isOwner = address === walletAddress

  return (
    <WithErrorHandler error={[followedListError]}>
      <WithLoadingIndicator value={[followedListData]} customLoader={<PositionTableLoadingState />}>
        {([followedMakerPositions]) => {
          const borrowPositions = getBorrowPositionRows(
            parseMakerBorrowPositionRows(followedMakerPositions),
          )
          const multiplyPositions = getMultiplyPositionRows(
            parseMakerMultiplyPositionRows(followedMakerPositions),
          )
          const earnPositions = getEarnPositionRows(
            parseMakerEarnPositionRows(followedMakerPositions),
          )

          return followedMakerPositions.length ? (
            <AssetsTableContainer
              title={`${t(`vaults-overview.${isOwner ? 'owner' : 'non-owner'}-followed-positions`, {
                address: formatAddress(address),
              })} (${followedMakerPositions.length})`}
            >
              {borrowPositions.length > 0 && (
                <>
                  <AssetsTableHeading>
                    Summer.fi {t('nav.borrow')} ({borrowPositions.length})
                  </AssetsTableHeading>
                  <AssetsResponsiveTable rows={borrowPositions} tooltips={positionsTableTooltips} />
                </>
              )}
              {multiplyPositions.length > 0 && (
                <>
                  <AssetsTableHeading>
                    Summer.fi {t('nav.multiply')} ({multiplyPositions.length})
                  </AssetsTableHeading>
                  <AssetsResponsiveTable
                    rows={multiplyPositions}
                    tooltips={positionsTableTooltips}
                  />
                </>
              )}
              {earnPositions.length > 0 && (
                <>
                  <AssetsTableHeading>
                    Summer.fi {t('nav.earn')} ({earnPositions.length})
                  </AssetsTableHeading>
                  <AssetsResponsiveTable rows={earnPositions} tooltips={positionsTableTooltips} />
                </>
              )}
            </AssetsTableContainer>
          ) : (
            <PositionTableEmptyState
              title={`${t(`vaults-overview.${isOwner ? 'owner' : 'non-owner'}-followed-positions`, {
                address: formatAddress(address),
              })}`}
              header={t(`vaults-overview.no-follow-header-${isOwner ? 'owner' : 'non-owner'}`, {
                address: formatAddress(address),
              })}
              content={
                <Trans
                  i18nKey="vaults-overview.no-follow-content"
                  components={[
                    <AppLink href="/discover" sx={{ fontWeight: 'regular', fontSize: 3 }} />,
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
