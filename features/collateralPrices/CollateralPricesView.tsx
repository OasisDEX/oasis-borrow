import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ColumnDef, Table, TableSortHeader } from 'components/Table'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Heading, Text } from 'theme-ui'

import { TokenSymbol } from '../../components/TokenSymbol'
import { CollateralPrice } from './collateralPrices'
import {
  CollateralPricesWithFilters,
  CollateralPricesWithFiltersState,
} from './collateralPricesWithFilters'

function getPercentageColor(percentageChange: BigNumber) {
  return percentageChange.isEqualTo(zero)
    ? 'text'
    : percentageChange.gt(zero)
    ? 'success100'
    : 'critical100'
}

function CellOracleUpdate({ update }: { update?: Date }) {
  return (
    <Text>
      {update
        ? `${update.toLocaleDateString()} ${update.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`
        : '--'}
    </Text>
  )
}

const COLLATERAL_COLUMNS: ColumnDef<CollateralPrice, CollateralPricesWithFiltersState>[] = [
  {
    headerLabel: 'oracles.token',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ token }) => <TokenSymbol token={token} displaySymbol />,
  },
  {
    headerLabel: 'oracles.current-price',
    header: ({ label, ...filters }) => (
      <TableSortHeader filters={filters} sortBy="currentPrice">
        {label}
      </TableSortHeader>
    ),
    cell: ({ currentPrice }) => <Text>${formatAmount(currentPrice, 'USD')}</Text>,
  },
  {
    headerLabel: 'oracles.next-price',
    header: ({ label, ...filters }) => (
      <TableSortHeader filters={filters} sortBy="nextPrice">
        {label}
      </TableSortHeader>
    ),
    cell: ({ nextPrice, percentageChange }) => (
      <Text
        sx={{
          color: getPercentageColor(percentageChange),
        }}
      >
        ${formatAmount(nextPrice, 'USD')}
      </Text>
    ),
  },
  {
    headerLabel: 'oracles.change',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ percentageChange }) => (
      <Text
        sx={{
          color: getPercentageColor(percentageChange),
        }}
      >
        {formatPercent(percentageChange.times(100), {
          precision: 4,
          plus: true,
        })}
      </Text>
    ),
  },
  {
    headerLabel: 'oracles.last-update',
    header: ({ label, ...filters }) => (
      <TableSortHeader filters={filters} sortBy="currentPriceUpdate">
        {label}
      </TableSortHeader>
    ),
    cell: ({ currentPriceUpdate }) => <CellOracleUpdate update={currentPriceUpdate} />,
  },
  {
    headerLabel: 'oracles.next-update',
    header: ({ label, ...filters }) => (
      <TableSortHeader filters={filters} sortBy="nextPriceUpdate">
        {label}
      </TableSortHeader>
    ),
    cell: ({ nextPriceUpdate }) => <CellOracleUpdate update={nextPriceUpdate} />,
  },
  {
    headerLabel: 'oracles.oracle-type',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ isStaticPrice }) => <Text>{isStaticPrice ? 'DSvalue' : 'OSM'}</Text>,
  },
]

function CollateralPricesTable({
  collateralPrices,
}: {
  collateralPrices: CollateralPricesWithFilters
}) {
  const { t } = useTranslation()

  return (
    <Box>
      <Table
        data={collateralPrices.data}
        primaryKey="token"
        state={collateralPrices.filters}
        columns={COLLATERAL_COLUMNS}
        noResults={<Box>{t('no-results')}</Box>}
      />
    </Box>
  )
}

export function CollateralPricesView() {
  const { collateralPrices$ } = useAppContext()
  const [collateralPrices, collateralPricesWithError] = useObservable(collateralPrices$)
  const { t } = useTranslation()

  return (
    <Grid sx={{ position: 'relative', zIndex: 1, width: '100%' }} gap={5}>
      <Grid pt={5} pb={4}>
        <Heading variant="header2">{t('oracles.header')}</Heading>
        <Box sx={{ maxWidth: '55.5em', color: 'neutral80' }}>{t('oracles.description')}</Box>
      </Grid>
      <WithErrorHandler error={collateralPricesWithError}>
        <WithLoadingIndicator
          value={collateralPrices}
          customLoader={
            <Box
              sx={{
                position: 'relative',
                width: '100%',
              }}
            >
              <AppSpinner
                sx={{ mx: 'auto', display: 'block' }}
                variant="styles.spinner.extraLarge"
              />
            </Box>
          }
        >
          {(collateralPrices) => <CollateralPricesTable {...{ collateralPrices }} />}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
