import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { getAddress } from 'ethers/lib/utils'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableHeading } from 'features/discover/common/DiscoverTableHeading'
import { PositionTableEmptyState } from 'features/vaultsOverview/components/PositionTableEmptyState'
import { PositionTableLoadingState } from 'features/vaultsOverview/components/PositionTableLoadingState'
import {
  followTableSkippedHeaders,
  getAaveMultiplyPositions,
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
import React, { useMemo } from 'react'

export function FollowedTable({ address }: { address: string }) {
  const { t } = useTranslation()
  // FIXME ŁW prevent react hook error when fetching aave positions
  const { context$, followedMakerVaults$, followedAavePositions$ } = useAppContext()
  const { walletAddress } = useAccount()
  const [contextData, contextError] = useObservable(context$)
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [followedMakerVaultsData, followedMakerVaultsError] = useObservable(
    useMemo(() => followedMakerVaults$(checksumAddress), [checksumAddress]),
  )
  const [followedAavePositionsData, followedAavePositionsError] = useObservable(
    followedAavePositions$(checksumAddress),
  )
  const isOwner = address === walletAddress

  const multiplyPositions = useMemo(() => {
    return followedMakerVaultsData && followedAavePositionsData
      ? [
          ...getMakerMultiplyPositions({ positions: followedMakerVaultsData }),
          ...getAaveMultiplyPositions({ positions: followedAavePositionsData }),
        ]
      : []
  }, [followedMakerVaultsData, followedAavePositionsData])
  console.log('multiply positions')
  console.log(multiplyPositions)
  console.log('followed aave positions data')
  console.log(followedAavePositionsData)
  console.log('followed aave positions error')
  console.log(followedAavePositionsError)
  console.log('multiply positions aave')
  console.log(multiplyPositions[1])
  return (
    <WithErrorHandler error={[contextError, followedMakerVaultsError, followedAavePositionsError]}>
      <WithLoadingIndicator
        value={[contextData, followedMakerVaultsData]}
        customLoader={<PositionTableLoadingState />}
      >
        {([context, followedMakerPositions,/*, followedAavePositions*/]) => {
          const borrowPositions = getMakerBorrowPositions({ positions: followedMakerPositions })
          // const multiplyPositions = getMakerMultiplyPositions({ positions: followedMakerPositions })
          const earnPositions = getMakerEarnPositions({ positions: followedMakerPositions })

          return followedMakerPositions.length ? (
            <DiscoverTableContainer
              title={`${t(`vaults-overview.${isOwner ? 'owner' : 'non-owner'}-followed-positions`, {
                address: formatAddress(address),
              })} (${followedMakerPositions.length})`}
            >
              {borrowPositions.length > 0 && (
                <>
                  <DiscoverTableHeading>
                    Oasis {t('nav.borrow')} ({borrowPositions.length})
                  </DiscoverTableHeading>
                  <DiscoverResponsiveTable
                    rows={borrowPositions}
                    skip={followTableSkippedHeaders}
                    tooltips={positionsTableTooltips}
                    {...(!!walletAddress && {
                      follow: {
                        followerAddress: walletAddress,
                        chainId: context.chainId,
                      },
                    })}
                  />
                </>
              )}
              {multiplyPositions.length > 0 && (
                <>
                  <DiscoverTableHeading>
                    Oasis {t('nav.multiply')} ({multiplyPositions.length})
                  </DiscoverTableHeading>
                  <DiscoverResponsiveTable
                    rows={multiplyPositions}
                    skip={followTableSkippedHeaders}
                    tooltips={positionsTableTooltips}
                    {...(!!walletAddress && {
                      follow: {
                        followerAddress: walletAddress,
                        chainId: context.chainId,
                      },
                    })}
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
                    {...(!!walletAddress && {
                      follow: {
                        followerAddress: walletAddress,
                        chainId: context.chainId,
                      },
                    })}
                  />
                </>
              )}
            </DiscoverTableContainer>
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
