import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ColumnDef, Table } from 'components/Table'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { formatAddress, formatCryptoBalance } from 'helpers/formatters/format'
import { useObservable, useObservableWithError } from 'helpers/observableHook'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Heading, Link, Text } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

import { interpolate } from '../../helpers/interpolate'
import { VaultHistoryEvent } from './vaultHistory'

const columns: ColumnDef<VaultHistoryEvent, {}>[] = [
  {
    headerLabel: 'event.activity',
    header: ({ label }) => <Text>{label}</Text>,
    cell: (event) => {
      const { t } = useTranslation()
      const translation = t(`history.${event.kind.toLowerCase()}`, {
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
          'coveredDebt' in event && event.coveredDebt ? formatCryptoBalance(event.coveredDebt) : 0,
        cdpId: 'cdpId' in event ? event.cdpId : undefined,
        auctionId: 'auctionId' in event ? event.auctionId : undefined,
        token: event.token,
      })

      return (
        <>
          {interpolate(translation, {
            0: ({ children }) => (
              <Text as="strong" variant="strong">
                {children}
              </Text>
            ),
          })}
        </>
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
  const { vaultHistory$, context$ } = useAppContext()
  const vaultHistoryWithError = useObservableWithError(vaultHistory$(id))
  const context = useObservable(context$)
  const { t } = useTranslation()

  return (
    <Box sx={{ gridColumn: '1/2', zIndex: 1 }}>
      <Heading variant="header3" sx={{ mb: '24px' }}>
        {t('vault-history')}
      </Heading>
      <WithLoadingIndicator
        {...vaultHistoryWithError}
        customLoader={
          <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <AppSpinner sx={{ mx: 'auto', display: 'block' }} variant="styles.spinner.large" />
          </Flex>
        }
      >
        {(vaultHistory) => (
          <Box sx={{ ...slideInAnimation, position: 'relative' }}>
            <Table
              data={vaultHistory}
              primaryKey="id"
              state={{}}
              columns={columns}
              deriveRowProps={(row) => ({
                href: `${context?.etherscan.url}/tx/${row.hash}`,
                target: '_blank',
              })}
            />
          </Box>
        )}
      </WithLoadingIndicator>
    </Box>
  )
}
