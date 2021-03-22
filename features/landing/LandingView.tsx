import { Icon } from '@makerdao/dai-ui-icons'
import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { ColumnDef, Table, TableSortHeader } from 'components/Table'
import { IlksFilterState } from 'features/ilks/ilksFilters'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { FeaturedIlks, Filters } from 'features/vaultsOverview/VaultsOverviewView'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable, useObservableWithError } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React, { ComponentProps, useCallback } from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

export function TokenSymbol({
  token,
  ...props
}: { token: string } & Omit<ComponentProps<typeof Icon>, 'name'>) {
  const tokenInfo = getToken(token)

  return (
    <Flex>
      <Icon
        name={tokenInfo.iconCircle}
        size="26px"
        sx={{ verticalAlign: 'sub', mr: 2 }}
        {...props}
      />
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', whiteSpace: 'nowrap' }}>
        {tokenInfo.name}
      </Text>
    </Flex>
  )
}

const ilksColumns: ColumnDef<IlkWithBalance, IlksFilterState>[] = [
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
      <Text sx={{ textAlign: 'right' }}>{formatPercent(stabilityFee.times(100))}</Text>
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
    headerLabel: '',
    header: () => null,
    cell: ({ ilk }) => (
      <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
        <AppLink
          sx={{ width: ['100%', 'inherit'], textAlign: 'center' }}
          variant="secondary"
          href={`/vaults/open/${ilk}`}
        >
          <Trans i18nKey="open-vault" />
        </AppLink>
      </Box>
    ),
  },
]

export function LandingView() {
  const { landing$ } = useAppContext()
  const { t } = useTranslation()
  const [landing, landingError] = useObservableWithError(landing$)

  const onIlkSearch = useCallback(
    (search: string) => {
      landing?.ilks.filters.change({ kind: 'search', search })
    },
    [landing?.ilks.filters],
  )
  const onIlksTagChange = useCallback(
    (tagFilter: CoinTag | undefined) => {
      landing?.ilks.filters.change({ kind: 'tagFilter', tagFilter })
    },
    [landing?.ilks.filters],
  )

  if(landingError !== undefined) {
    console.log(landingError)
    return <>Error while fetching data!</>
  }

  if (landing === undefined) {
    return <>loading...</>
  }



  return (
    <Grid sx={{ flex: 1 }}>
      <Box sx={{ width: '600px', justifySelf: 'center', textAlign: 'center', my: 4 }}>
        <Heading as="h1" sx={{ fontSize: 7, my: 3 }}>
          {t('landing.hero.headline')}
        </Heading>
        <Text>{t('landing.hero.subheader')}</Text>
      </Box>
      <Box sx={{ my: 4 }}>
        <FeaturedIlks ilks={landing.featuredIlks} />
      </Box>
      <Filters
        onSearch={onIlkSearch}
        search={landing.ilks.filters.search}
        onTagChange={onIlksTagChange}
        tagFilter={landing.ilks.filters.tagFilter}
        defaultTag="all-assets"
      />
      <Table
        data={landing.ilks.data}
        primaryKey="ilk"
        state={landing.ilks.filters}
        columns={ilksColumns}
      />
    </Grid>
  )
}
