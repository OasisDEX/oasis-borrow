import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { getAddress } from 'ethers/lib/utils'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { DiscoverTableHeading } from 'features/discover/common/DiscoverTableHeading'
import { PositionTableEmptyState } from 'features/vaultsOverview/components/PositionTableEmptyState'
import { PositionTableLoadingState } from 'features/vaultsOverview/components/PositionTableLoadingState'
import {
  getAaveEarnPositions,
  getAaveMultiplyPositions,
  getAavePositionOfType,
  getAjnaPositionOfType,
  getDsrPosition,
  getMakerBorrowPositions,
  getMakerEarnPositions,
  getMakerMultiplyPositions,
  getMakerPositionOfType,
  positionsTableSkippedHeaders,
  positionsTableTooltips,
} from 'features/vaultsOverview/helpers'
import {
  getBorrowPositionRows,
  getMultiplyPositionRows,
  parseAjnaBorrowPositionRows,
  parseMakerBorrowPositionRows,
  parseMakerMultiplyPositionRows,
} from 'features/vaultsOverview/parsers'
import { PositionsList } from 'features/vaultsOverview/vaultsOverview'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAddress } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { Trans, useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

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
          const dsrPosition = getDsrPosition({
            dsr: ownersPositionsList.dsrPosition,
            address,
            skipShareButton: true,
          })
          const combinedPositionsData = [
            ...ownersPositionsList.makerPositions,
            ...ownersPositionsList.aavePositions,
            ...dsrPosition,
          ]
          const borrowPositions = getMakerBorrowPositions({
            positions: ownersPositionsList.makerPositions,
            skipShareButton: true,
          })
          const multiplyPositions = useMemo(() => {
            return [
              ...getMakerMultiplyPositions({
                positions: ownersPositionsList.makerPositions,
                skipShareButton: true,
              }),
              ...getAaveMultiplyPositions({
                positions: ownersPositionsList.aavePositions,
                skipShareButton: true,
              }),
            ]
          }, [ownersPositionsList])
          const earnPositions = [
            ...getMakerEarnPositions({
              positions: ownersPositionsList.makerPositions,
              skipShareButton: true,
            }),
            ...getAaveEarnPositions({
              positions: ownersPositionsList.aavePositions,
              skipShareButton: true,
            }),
            ...dsrPosition,
          ]

          return combinedPositionsData.length ? (
            <DiscoverTableContainer
              title={`${t(`vaults-overview.${isOwner ? 'owner' : 'non-owner'}-positions`, {
                address: formatAddress(address),
              })} (${combinedPositionsData.length})`}
            >
              <PositionsTableInner ownersPositionsList={ownersPositionsList} />
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
              {multiplyPositions.length > 0 && (
                <>
                  <DiscoverTableHeading>
                    Oasis {t('nav.multiply')} ({multiplyPositions.length})
                  </DiscoverTableHeading>
                  <DiscoverResponsiveTable
                    rows={multiplyPositions}
                    skip={positionsTableSkippedHeaders}
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
                    skip={positionsTableSkippedHeaders}
                    tooltips={positionsTableTooltips}
                  />
                </>
              )}
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

export function PositionsTableInner({
  ownersPositionsList,
}: {
  ownersPositionsList: PositionsList
}) {
  const { t } = useTranslation()

  console.log('ownersPositionsListData')
  console.log(ownersPositionsList)

  const makerPositions = useMemo(() => getMakerPositionOfType(ownersPositionsList.makerPositions), [
    ownersPositionsList.makerPositions,
  ])
  const aavePositions = useMemo(() => getAavePositionOfType(ownersPositionsList.aavePositions), [
    ownersPositionsList.aavePositions,
  ])
  const ajnaPositions = useMemo(() => getAjnaPositionOfType(ownersPositionsList.ajnaPositions), [
    ownersPositionsList.ajnaPositions,
  ])

  const parsedMakerBorrowPositions = useMemo(
    () => parseMakerBorrowPositionRows(makerPositions.borrow),
    [makerPositions.borrow],
  )
  const parsedAjnaBorrowPositions = useMemo(
    () => parseAjnaBorrowPositionRows(ajnaPositions.borrow),
    [ajnaPositions.borrow],
  )
  const borrowPositionsRows = useMemo(
    () => getBorrowPositionRows([...parsedMakerBorrowPositions, ...parsedAjnaBorrowPositions]),
    [parsedMakerBorrowPositions, parsedAjnaBorrowPositions],
  )

  const parsedMakerMultiplyPositions = useMemo(
    () => parseMakerMultiplyPositionRows(makerPositions.multiply),
    [makerPositions.multiply],
  )
  const multiplyPositionsRows = useMemo(
    () => getMultiplyPositionRows([...parsedMakerMultiplyPositions]),
    [parsedMakerMultiplyPositions],
  )

  return (
    <>
      {borrowPositionsRows.length > 0 && (
        <>
          <DiscoverTableHeading>
            Oasis {t('nav.borrow')} ({borrowPositionsRows.length})
          </DiscoverTableHeading>
          <DiscoverResponsiveTable rows={borrowPositionsRows} />
        </>
      )}
      {multiplyPositionsRows.length > 0 && (
        <>
          <DiscoverTableHeading>
            Oasis {t('nav.multiply')} ({multiplyPositionsRows.length})
          </DiscoverTableHeading>
          <DiscoverResponsiveTable rows={multiplyPositionsRows} />
        </>
      )}
    </>
  )
}
