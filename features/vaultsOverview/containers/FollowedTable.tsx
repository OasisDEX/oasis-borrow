import { useAppContext } from 'components/AppContextProvider'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableHeading } from 'components/assetsTable/AssetsTableHeading'
import { AppLink } from 'components/Links'
import { getAddress } from 'ethers/lib/utils'
import { PositionTableEmptyState } from 'features/vaultsOverview/components/PositionTableEmptyState'
import { PositionTableLoadingState } from 'features/vaultsOverview/components/PositionTableLoadingState'
import {
  getMakerBorrowPositions,
  getMakerEarnPositions,
  getMakerMultiplyPositions,
  positionsTableTooltips,
} from 'features/vaultsOverview/helpers'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAddress } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

export function FollowedTable({ address }: { address: string }) {
  const { t } = useTranslation()
  const { followedList$ } = useAppContext()
  const { chainId, walletAddress } = useAccount()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [followedListData, followedListError] = useObservable(followedList$(checksumAddress))

  const isOwner = address === walletAddress
  const showFollowButton = !!chainId && !!walletAddress

  return (
    <WithErrorHandler error={[followedListError]}>
      <WithLoadingIndicator value={[followedListData]} customLoader={<PositionTableLoadingState />}>
        {([followedMakerPositions]) => {
          const borrowPositions = getMakerBorrowPositions({
            positions: followedMakerPositions,
            shareButton: true,
            ...(showFollowButton && {
              followButton: { chainId, followerAddress: walletAddress },
            }),
          })
          const multiplyPositions = getMakerMultiplyPositions({
            positions: followedMakerPositions,
            shareButton: true,
            ...(showFollowButton && {
              followButton: { chainId, followerAddress: walletAddress },
            }),
          })
          const earnPositions = getMakerEarnPositions({
            positions: followedMakerPositions,
            shareButton: true,
            ...(showFollowButton && {
              followButton: { chainId, followerAddress: walletAddress },
            }),
          })

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
                  <AssetsResponsiveTable
                    rows={borrowPositions}
                    tooltips={positionsTableTooltips}
                    isWithFollow={showFollowButton}
                  />
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
                    isWithFollow={showFollowButton}
                  />
                </>
              )}
              {earnPositions.length > 0 && (
                <>
                  <AssetsTableHeading>
                    Summer.fi {t('nav.earn')} ({earnPositions.length})
                  </AssetsTableHeading>
                  <AssetsResponsiveTable
                    rows={earnPositions}
                    tooltips={positionsTableTooltips}
                    isWithFollow={showFollowButton}
                  />
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
