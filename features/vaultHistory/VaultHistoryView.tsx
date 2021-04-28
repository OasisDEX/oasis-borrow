import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ColumnDef, Table } from 'components/Table'
import { AppSpinner } from 'helpers/AppSpinner'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import moment from 'moment'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Heading, Link, Text } from 'theme-ui'

import { VaultHistoryEvent } from './vaultHistory'

const columns: ColumnDef<VaultHistoryEvent, {}>[] = [
  {
    headerLabel: 'event.activity',
    header: ({ label }) => <Text>{label}</Text>,
    cell: (event) => {
      return (
        <Trans
          i18nKey={`history.${event.kind.toLowerCase()}`}
          values={{
            transferTo: 'transferTo' in event && formatAddress(event.transferTo),
            transferFrom: 'transferFrom' in event && formatAddress(event.transferFrom),
            collateralAmount:
              'collateralAmount' in event && event.collateralAmount
                ? formatCryptoBalance(event.collateralAmount.abs())
                : 0,
            daiAmount: 'daiAmount' in event ? formatCryptoBalance(event.daiAmount.abs()) : 0,
            remainingCollateral:
              'remainingCollateral' in event && event.remainingCollateral
                ? formatCryptoBalance(event.remainingCollateral)
                : 0,
            collateralTaken:
              'collateralTaken' in event && event.collateralTaken
                ? formatCryptoBalance(event.collateralTaken)
                : 0,
            coveredDebt:
              'coveredDebt' in event && event.coveredDebt
                ? formatCryptoBalance(event.coveredDebt)
                : 0,
            cdpId: 'cdpId' in event ? event.cdpId : undefined,
            auctionId: 'auctionId' in event ? event.auctionId : undefined,
            token: event.token,
          }}
          components={[<Text as="strong" variant="strong" />]}
        />
      )
    },
  },
  {
    headerLabel: 'event.time',
    header: ({ label }) => <Text>{label}</Text>,
    cell: ({ timestamp }) => {
      const date = moment(timestamp)
      return <Text sx={{ whiteSpace: 'nowrap' }}>{date.format('MMM DD, YYYY, h:mma')}</Text>
    },
  },
  {
    headerLabel: '',
    header: () => null,
    cell: ({ hash, etherscan }) => {
      const { t } = useTranslation()

      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            variant="secondary"
            href={`${etherscan?.url}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('view-on-etherscan')} -{'>'}
          </Link>
        </Box>
      )
    },
  },
]

export function VaultHistoryView({ id }: { id: BigNumber }) {
  const { vaultHistory$ } = useAppContext()
  const vaultHistory = useObservable(vaultHistory$(id))
  const { t } = useTranslation()

  return (
    <Box sx={{ gridColumn: '1/2' }}>
      <Heading sx={{ mb: 4 }}>{t('vault-history')}</Heading>
      {vaultHistory ? (
        <Table data={vaultHistory} primaryKey="id" state={{}} columns={columns} />
      ) : (
        <AppSpinner sx={{ mx: 'auto', display: 'block' }} variant="styles.spinner.large" />
      )}
    </Box>
  )
}
