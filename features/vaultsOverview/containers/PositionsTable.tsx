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
  getDsrValue,
  getMakerBorrowPositions,
  getMakerEarnPositions,
  getMakerMultiplyPositions,
  getMakerPositionOfType,
  positionsTableSkippedHeaders,
  positionsTableTooltips,
} from 'features/vaultsOverview/helpers'
import {
  getBorrowPositionRows,
  getEarnPositionRows,
  getMultiplyPositionRows,
  parseAaveEarnPositionRows,
  parseAaveMultiplyPositionRows,
  parseAjnaBorrowPositionRows,
  parseAjnaEarnPositionRows,
  parseDsrEarnPosition,
  parseMakerBorrowPositionRows,
  parseMakerEarnPositionRows,
  parseMakerMultiplyPositionRows,
} from 'features/vaultsOverview/parsers'
import { PositionsList } from 'features/vaultsOverview/vaultsOverview'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAddress } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

export function PositionsTable({ address }: { address: string }) {
  const ajnaEnabled = useFeatureToggle('Ajna')
  const { t } = useTranslation()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const { ownersPositionsList$ } = useAppContext()
  const { walletAddress } = useAccount()
  const memoizedOwnersPositionList$ = useMemo(
    () => ownersPositionsList$(checksumAddress),
    [checksumAddress],
  )
  const [ownersPositionsListData, ownersPositionsListError] = useObservable(
    memoizedOwnersPositionList$,
  )

  const isOwner = address === walletAddress

  return (
    <WithErrorHandler error={[ownersPositionsListError]}>
      <WithLoadingIndicator
        value={[ownersPositionsListData]}
        customLoader={<PositionTableLoadingState />}
      >
        {([ownersPositionsList]) => {
          let amountOfPositions =
            ownersPositionsList.makerPositions.length + ownersPositionsList.aavePositions.length
          if (getDsrValue(ownersPositionsList.dsrPosition).gt(zero)) amountOfPositions++
          if (ajnaEnabled) amountOfPositions += ownersPositionsList.ajnaPositions.length

          return amountOfPositions ? (
            <DiscoverTableContainer
              title={`${t(`vaults-overview.${isOwner ? 'owner' : 'non-owner'}-positions`, {
                address: formatAddress(address),
              })} (${amountOfPositions})`}
            >
              {ajnaEnabled ? (
                <PositionsTableWithAjna
                  address={address}
                  ownersPositionsList={ownersPositionsList}
                />
              ) : (
                <PositionsTableWithoutAjna
                  address={address}
                  ownersPositionsList={ownersPositionsList}
                />
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

export function PositionsTableWithoutAjna({
  address,
  ownersPositionsList,
}: {
  address: string
  ownersPositionsList: PositionsList
}) {
  const { t } = useTranslation()

  const dsrPosition = getDsrPosition({
    dsr: ownersPositionsList.dsrPosition,
    address,
    skipShareButton: true,
  })
  const borrowPositions = getMakerBorrowPositions({
    positions: ownersPositionsList.makerPositions,
    skipShareButton: true,
  })
  const multiplyPositions = [
    ...getMakerMultiplyPositions({
      positions: ownersPositionsList.makerPositions,
      skipShareButton: true,
    }),
    ...getAaveMultiplyPositions({
      positions: ownersPositionsList.aavePositions,
      skipShareButton: true,
    }),
  ]
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

  return (
    <>
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
    </>
  )
}

export function PositionsTableWithAjna({
  address,
  ownersPositionsList,
}: {
  address: string
  ownersPositionsList: PositionsList
}) {
  const { t } = useTranslation()

  const makerPositions = useMemo(
    () => getMakerPositionOfType(ownersPositionsList.makerPositions),
    [ownersPositionsList.makerPositions],
  )
  const aavePositions = useMemo(
    () => getAavePositionOfType(ownersPositionsList.aavePositions),
    [ownersPositionsList.aavePositions],
  )
  const ajnaPositions = useMemo(
    () => getAjnaPositionOfType(ownersPositionsList.ajnaPositions),
    [ownersPositionsList.ajnaPositions],
  )

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
  const parsedAaveMultiplyPositions = useMemo(
    () => parseAaveMultiplyPositionRows(aavePositions.multiply),
    [aavePositions.multiply],
  )
  const multiplyPositionsRows = useMemo(
    () =>
      getMultiplyPositionRows([...parsedMakerMultiplyPositions, ...parsedAaveMultiplyPositions]),
    [parsedMakerMultiplyPositions, parsedAaveMultiplyPositions],
  )

  const parsedMakerEarnPositions = useMemo(
    () => parseMakerEarnPositionRows(makerPositions.earn),
    [makerPositions.earn],
  )
  const parsedAaveEarnPositions = useMemo(
    () => parseAaveEarnPositionRows(aavePositions.earn),
    [aavePositions.earn],
  )
  const parsedAjnaEarnPositions = useMemo(
    () => parseAjnaEarnPositionRows(ajnaPositions.earn),
    [ajnaPositions.earn],
  )
  const parsedDsrEarnPositions = useMemo(
    () => parseDsrEarnPosition({ address, dsr: ownersPositionsList.dsrPosition }),
    [address, ownersPositionsList.dsrPosition],
  )
  const earnPositionsRows = useMemo(
    () =>
      getEarnPositionRows([
        ...parsedMakerEarnPositions,
        ...parsedAaveEarnPositions,
        ...parsedAjnaEarnPositions,
        ...parsedDsrEarnPositions,
      ]),
    [
      parsedMakerEarnPositions,
      parsedAaveEarnPositions,
      parsedAjnaEarnPositions,
      parsedDsrEarnPositions,
    ],
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
      {earnPositionsRows.length > 0 && (
        <>
          <DiscoverTableHeading>
            Oasis {t('nav.earn')} ({earnPositionsRows.length})
          </DiscoverTableHeading>
          <DiscoverResponsiveTable rows={earnPositionsRows} />
        </>
      )}
    </>
  )
}
