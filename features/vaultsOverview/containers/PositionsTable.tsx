import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableHeading } from 'components/assetsTable/AssetsTableHeading'
import { AppLink } from 'components/Links'
import { PositionTableEmptyState } from 'features/vaultsOverview/components/PositionTableEmptyState'
import { PositionTableLoadingState } from 'features/vaultsOverview/components/PositionTableLoadingState'
import {
  getAavePositionOfType,
  getAjnaPositionOfType,
  getDsrValue,
  getMakerPositionOfType,
  positionsTableTooltips,
} from 'features/vaultsOverview/helpers'
import {
  getBorrowPositionRows,
  getEarnPositionRows,
  getMultiplyPositionRows,
  parseAaveBorrowPositionRows,
  parseAaveEarnPositionRows,
  parseAaveMultiplyPositionRows,
  parseAjnaBorrowPositionRows,
  parseAjnaEarnPositionRows,
  parseAjnaMultiplyPositionRows,
  parseDsrEarnPosition,
  parseMakerBorrowPositionRows,
  parseMakerEarnPositionRows,
  parseMakerMultiplyPositionRows,
} from 'features/vaultsOverview/parsers'
import type { PositionsList } from 'features/vaultsOverview/vaultsOverview'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAddress } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

export function PositionsTable({
  address,
  ownersPositionsListData,
  ownersPositionsListError,
}: {
  address: string
  ownersPositionsListData?: PositionsList
  ownersPositionsListError?: any
}) {
  const { t } = useTranslation()
  const { walletAddress } = useAccount()

  const isOwner = address === walletAddress

  return (
    <WithErrorHandler error={[ownersPositionsListError]}>
      <WithLoadingIndicator
        value={[ownersPositionsListData]}
        customLoader={<PositionTableLoadingState />}
      >
        {([ownersPositionsList]) => {
          let amountOfPositions =
            ownersPositionsList.makerPositions.length +
            ownersPositionsList.aaveLikePositions.length +
            ownersPositionsList.ajnaPositions.length
          if (getDsrValue(ownersPositionsList.dsrPosition).gt(zero)) amountOfPositions++

          return amountOfPositions ? (
            <AssetsTableContainer
              title={`${t(`vaults-overview.${isOwner ? 'owner' : 'non-owner'}-positions`, {
                address: formatAddress(address),
              })} (${amountOfPositions})`}
            >
              <PositionsTableContent address={address} ownersPositionsList={ownersPositionsList} />
            </AssetsTableContainer>
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

export function PositionsTableContent({
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
    () => getAavePositionOfType(ownersPositionsList.aaveLikePositions),
    [ownersPositionsList.aaveLikePositions],
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
  const parsedAaveBorrowPostions = useMemo(
    () => parseAaveBorrowPositionRows(aavePositions.borrow),
    [aavePositions.borrow],
  )
  const borrowPositionsRows = useMemo(
    () =>
      getBorrowPositionRows([
        ...parsedMakerBorrowPositions,
        ...parsedAjnaBorrowPositions,
        ...parsedAaveBorrowPostions,
      ]),
    [parsedMakerBorrowPositions, parsedAjnaBorrowPositions, parsedAaveBorrowPostions],
  )
  const parsedAjnaMultiplyPositions = useMemo(
    () => parseAjnaMultiplyPositionRows(ajnaPositions.multiply),
    [ajnaPositions.multiply],
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
      getMultiplyPositionRows([
        ...parsedMakerMultiplyPositions,
        ...parsedAaveMultiplyPositions,
        ...parsedAjnaMultiplyPositions,
      ]),
    [parsedMakerMultiplyPositions, parsedAaveMultiplyPositions, parsedAjnaMultiplyPositions],
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
          <AssetsTableHeading>
            Summer.fi {t('nav.borrow')} ({borrowPositionsRows.length})
          </AssetsTableHeading>
          <AssetsResponsiveTable rows={borrowPositionsRows} tooltips={positionsTableTooltips} />
        </>
      )}
      {multiplyPositionsRows.length > 0 && (
        <>
          <AssetsTableHeading>
            Summer.fi {t('nav.multiply')} ({multiplyPositionsRows.length})
          </AssetsTableHeading>
          <AssetsResponsiveTable rows={multiplyPositionsRows} tooltips={positionsTableTooltips} />
        </>
      )}
      {earnPositionsRows.length > 0 && (
        <>
          <AssetsTableHeading>
            Summer.fi {t('nav.earn')} ({earnPositionsRows.length})
          </AssetsTableHeading>
          <AssetsResponsiveTable rows={earnPositionsRows} tooltips={positionsTableTooltips} />
        </>
      )}
    </>
  )
}
