import { useAppContext } from 'components/AppContextProvider'
import { ColumnDef, Table } from 'components/Table'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import moment from 'moment'
import { Trans, useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Box, Heading, Link, Text } from 'theme-ui'

import { BorrowEvent } from './historyEvents'

type ColumnData = BorrowEvent & {
  token: string
  etherscan:
    | {
        url: string
        apiUrl: string
        apiKey: string
      }
    | undefined
}

const columns: ColumnDef<ColumnData, {}>[] = [
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
            cdpId: 'cdpId' in event ? event.cdpId : undefined,
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
export function HistoryTable({ id, token }: { id: string; token: string }) {
  const { vaultHistory$, context$ } = useAppContext()
  const { t } = useTranslation()

  const history = useObservable(vaultHistory$(id))
  const context = useObservable(context$)
  const historyWithEtherscan = useMemo(
    () => history && history.map((el) => ({ ...el, etherscan: context?.etherscan, token })),
    [history, context?.etherscan, token],
  )

  if (historyWithEtherscan === undefined) {
    return null
  }

  return (
    <Box sx={{ gridColumn: '1/2' }}>
      <Heading sx={{ mb: 4 }}>{t('vault-history')}</Heading>
      <Table data={historyWithEtherscan} primaryKey="id" state={{}} columns={columns} />
    </Box>
  )
}
