import { Context } from 'blockchain/network'
import { CoinTag } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { ColumnDef, Table, TableSortHeader } from 'components/Table'
import { AccountDetails } from 'features/account/AccountData'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { Filters } from 'features/vaultsOverview/Filters'
import { formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { IlksFilterState } from '../ilks/ilksFilters'
import { TokenSymbol } from '../landing/LandingView'
import { OpenVaultOverview as OpenVaultOverviewData } from './openVaultData'

const ilksColumns: ColumnDef<IlkWithBalance, IlksFilterState & { isReadonly: boolean }>[] = [
  {
    headerLabel: 'system.asset',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ token }) => <TokenSymbol token={token} />,
  },
  {
    headerLabel: 'system.type',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ ilk }) => <Text>{ilk}</Text>,
  },
  {
    headerLabel: 'system.dai-available',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="ilkDebtAvailable">
        {label}
      </TableSortHeader>
    ),
    cell: ({ ilkDebtAvailable }) => (
      <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(ilkDebtAvailable)}</Text>
    ),
  },
  {
    headerLabel: 'system.stability-fee',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="stabilityFee">
        {label}
      </TableSortHeader>
    ),
    cell: ({ stabilityFee }) => (
      <Text sx={{ textAlign: 'right' }}>
        {formatPercent(stabilityFee.times(100), { precision: 2 })}
      </Text>
    ),
  },
  {
    headerLabel: 'system.min-coll-ratio',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="liquidationRatio">
        {label}
      </TableSortHeader>
    ),
    cell: ({ liquidationRatio }) => (
      <Text sx={{ textAlign: 'right' }}>{formatPercent(liquidationRatio.times(100))}</Text>
    ),
  },
  {
    headerLabel: 'system.in-my-wallet',
    header: ({ label, isReadonly, ...filters }) =>
      isReadonly ? null : (
        <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="balance">
          {label}
        </TableSortHeader>
      ),
    cell: (ilk) =>
      ilk.balance ? (
        <Flex sx={{ alignItems: 'baseline', justifyContent: 'flex-end' }}>
          <Text sx={{ textAlign: 'right' }}>
            {ilk.balance ? formatCryptoBalance(ilk.balance) : 0}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'muted', ml: 1 }}>
            {`($${ilk.balancePriceInUsd ? formatFiatBalance(ilk.balancePriceInUsd) : 0})`}
          </Text>
        </Flex>
      ) : null,
  },
  {
    headerLabel: '',
    header: () => null,
    cell: ({ ilk }) => (
      <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
        <AppLink
          sx={{ width: ['100%', 'inherit'], textAlign: 'center' }}
          variant="secondary"
          href={`/vaults/open/${ilk}`}
        >
          <Trans i18nKey="open-vault.title" />
        </AppLink>
      </Box>
    ),
  },
]

interface Props {
  vaultsOverview: OpenVaultOverviewData
  accountDetails: AccountDetails | undefined
  context: Context
}

function getHeaderTranslationKey(hasVaults: boolean) {
  const HEADER_PATH = 'ilks-list.headers'

  return hasVaults ? `${HEADER_PATH}.withVaults` : `${HEADER_PATH}.noVaults`
}
export function OpenVaultOverview({ vaultsOverview, accountDetails, context }: Props) {
  const { ilksWithFilters } = vaultsOverview
  const { t } = useTranslation()

  const onIlkSearch = useCallback(
    (search: string) => {
      ilksWithFilters.filters.change({ kind: 'search', search })
    },
    [ilksWithFilters.filters],
  )

  const onIlksTagChange = useCallback(
    (tagFilter: CoinTag | undefined) => {
      ilksWithFilters.filters.change({ kind: 'tagFilter', tagFilter })
    },
    [ilksWithFilters.filters],
  )

  const connectedAccount = context.status === 'connected' ? context.account : undefined

  const headerTranslationKey = getHeaderTranslationKey(
    !!accountDetails?.numberOfVaults && accountDetails.numberOfVaults > 0,
  )

  return (
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      <Heading variant="header2" sx={{ textAlign: 'center', my: 5 }} as="h1">
        <Trans i18nKey={headerTranslationKey} components={[<br />]} />
      </Heading>
      <Filters
        onSearch={onIlkSearch}
        search={ilksWithFilters.filters.search}
        onTagChange={onIlksTagChange}
        tagFilter={ilksWithFilters.filters.tagFilter}
        defaultTag="all-assets"
        searchPlaceholder={t('search-token')}
      />
      <Table
        data={ilksWithFilters.data}
        primaryKey="ilk"
        state={{ ...ilksWithFilters.filters, isReadonly: connectedAccount === undefined }}
        columns={ilksColumns}
        noResults={<Box>{t('no-results')}</Box>}
        deriveRowProps={(row) => ({ href: `/vaults/open/${row.ilk}` })}
      />
    </Grid>
  )
}

export function OpenVaultOverviewView() {
  const { openVaultOverview$, accountData$, context$ } = useAppContext()
  const openVaultOverview = useObservable(openVaultOverview$)
  const accountData = useObservable(accountData$)
  const context = useObservable(context$)

  if (openVaultOverview === undefined || context === undefined) {
    return null
  }

  return (
    <OpenVaultOverview
      vaultsOverview={openVaultOverview}
      context={context}
      accountDetails={accountData}
    />
  )
}
