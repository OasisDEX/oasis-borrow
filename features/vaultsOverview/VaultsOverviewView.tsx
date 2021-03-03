import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { AppLink } from 'components/Links'
import { ColumnDef, Table, TableSortHeader } from 'components/Table'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import {
  formatAddress,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { Trans, useTranslation } from 'i18n'
import React, { useCallback, useMemo } from 'react'
import { Box, Button, Card, Flex, Grid, Heading, Input, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { IlksFilterState, IlksWithFilters } from '../ilks/ilksFilters'
import { TokenSymbol } from '../landing/LandingView'
import { VaultsFilterState, VaultsWithFilters } from './vaultsFilters'
import { FeaturedIlk, VaultsOverview } from './vaultsOverview'
import { VaultSummary } from './vaultSummary'

const vaultsColumns: ColumnDef<Vault, VaultsFilterState>[] = [
  {
    headerLabel: 'system.asset',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ token }) => <TokenSymbol token={token} />,
  },
  {
    headerLabel: 'system.vault-id',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="id">
        {label}
      </TableSortHeader>
    ),
    cell: ({ id }) => <Text>#{id}</Text>,
  },
  {
    headerLabel: 'system.liquidation-price',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="liquidationPrice">
        {label}
      </TableSortHeader>
    ),
    cell: ({ liquidationPrice }) => (
      <Text sx={{ textAlign: 'right' }}>${formatFiatBalance(liquidationPrice)}</Text>
    ),
  },
  {
    headerLabel: 'system.coll-ratio',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateralizationRatio">
        {label}
      </TableSortHeader>
    ),
    cell: ({ collateralizationRatio }) => (
      <Text sx={{ textAlign: 'right' }}>{formatPercent(collateralizationRatio.times(100))}</Text>
    ),
  },
  {
    headerLabel: 'system.coll-locked',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateral">
        {label}
      </TableSortHeader>
    ),
    cell: ({ lockedCollateral, token }) => (
      <Text sx={{ textAlign: 'right' }}>
        {formatCryptoBalance(lockedCollateral)} {token}
      </Text>
    ),
  },
  {
    headerLabel: 'system.dai-debt',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="debt">
        {label}
      </TableSortHeader>
    ),
    cell: ({ debt }) => <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(debt)} DAI</Text>,
  },
  {
    headerLabel: '',
    header: () => <Text />,
    cell: ({ id }) => (
      <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
        <AppLink
          sx={{ width: ['100%', 'inherit'], textAlign: 'center' }}
          variant="secondary"
          as={`/${id}`}
          href={`/[vault]`}
        >
          Manage Vault
        </AppLink>
      </Box>
    ),
  },
]
function VaultsTable({ vaults }: { vaults: VaultsWithFilters }) {
  const { data, filters } = vaults
  return <Table data={data} primaryKey="id" state={filters} columns={vaultsColumns} />
}

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
          <Trans i18nKey="open-vault" />
        </AppLink>
      </Box>
    ),
  },
]
function AllIlks({
  ilks,
  isReadonly,
}: {
  ilks: IlksWithFilters
  isReadonly: boolean
  address: string
}) {
  const { data, filters } = ilks

  const tableState = useMemo(() => {
    return {
      ...filters,
      isReadonly,
    }
  }, [filters, isReadonly])

  return <Table primaryKey="ilk" data={data} state={tableState} columns={ilksColumns} />
}

interface CallToActionProps {
  ilk: FeaturedIlk
}
function CallToAction({ ilk }: CallToActionProps) {
  const token = getToken(ilk.token)
  const { t } = useTranslation()

  return (
    <Grid
      columns="1fr 1fr"
      sx={{
        flex: 1,
        cursor: 'pointer',
        background: token.background,
        borderRadius: 'large',
        p: 4,
        color: 'white',
      }}
    >
      <Box sx={{ gridColumn: '1/3' }}>
        <Text variant="caption">{ilk.title}</Text>
      </Box>
      <Box sx={{ gridColumn: '1/3' }}>
        <Heading variant="header2" sx={{ color: 'white', mb: 4 }}>
          {ilk.ilk}
        </Heading>
      </Box>
      <Flex>
        <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>
          {t('system.stability-fee')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>
          {formatPercent(ilk.stabilityFee)}
        </Text>
      </Flex>
      <Flex>
        <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>
          {t('system.min-coll-ratio')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>
          {formatPercent(ilk.liquidationRatio)}
        </Text>
      </Flex>
    </Grid>
  )
}
function Summary({ summary }: { summary: VaultSummary }) {
  const { t } = useTranslation()
  return (
    <Card>
      <Grid columns="repeat(4, 1fr)">
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.number-of-vaults')}
          </Text>
          <Text variant="header2">{summary.numberOfVaults}</Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.total-locked')}
          </Text>
          <Text variant="header2">${formatCryptoBalance(summary.totalCollateralPrice)}</Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.total-debt')}
          </Text>
          <Text variant="header2">{formatCryptoBalance(summary.totalDaiDebt)} DAI</Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            {t('vaults-overview.vaults-at-risk')}
          </Text>
          <Text variant="header2">{summary.vaultsAtRisk}</Text>
        </Box>
        <Graph assetRatio={summary.depositedAssetRatio} />
      </Grid>
    </Card>
  )
}

function Graph({ assetRatio }: { assetRatio: Dictionary<BigNumber> }) {
  const assets = Object.entries(assetRatio).sort(([, ratioA], [, ratioB]) =>
    ratioB.comparedTo(ratioA),
  )

  return (
    <Box sx={{ gridColumn: '1/5', my: 3 }}>
      <Flex sx={{ borderRadius: 'small', overflow: 'hidden', boxShadow: 'medium' }}>
        {assets.map(([token, ratio]) => (
          <Box
            key={token}
            sx={{
              flex: ratio.toString(),
              height: 2,
              background: getToken(token).color || 'lightGray',
            }}
          />
        ))}
      </Flex>
      <Flex>
        {assets.map(([token, ratio]) => (
          <Box key={token} sx={{ my: 2, flex: ratio.toString() }}>
            {ratio.gt(0.08) && (
              <Flex>
                <Box sx={{ mr: 1 }}>
                  <Icon
                    name={getToken(token).iconCircle}
                    size="26px"
                    sx={{ verticalAlign: 'sub', mr: 2 }}
                  />
                </Box>
                <Box>
                  <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
                    {getToken(token).name}
                  </Text>
                  <Text variant="paragraph3" sx={{ color: 'text.muted' }}>
                    {formatPercent(ratio.times(100), { precision: 2 })}
                  </Text>
                </Box>
              </Flex>
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

interface FiltersProps {
  onSearch: (search: string) => void
  onTagChange: (tag: CoinTag | undefined) => void
  search: string
  defaultTag: string
  tagFilter: CoinTag | undefined
}

export function Filters({ onSearch, search, onTagChange, tagFilter, defaultTag }: FiltersProps) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch(e.currentTarget.value)
    },
    [onSearch],
  )
  const { t } = useTranslation()

  return (
    <Flex>
      <Button
        onClick={() => onTagChange(undefined)}
        sx={{ mr: 2 }}
        data-selected={tagFilter === undefined}
        variant="filter"
      >
        {t(defaultTag)}
      </Button>
      <Button
        onClick={() => onTagChange('stablecoin')}
        sx={{ mr: 2 }}
        data-selected={tagFilter === 'stablecoin'}
        variant="filter"
      >
        {t('stablecoins')}
      </Button>
      <Button
        onClick={() => onTagChange('LPToken')}
        sx={{ mr: 2 }}
        data-selected={tagFilter === 'LPToken'}
        variant="filter"
      >
        {t('lp-tokens')}
      </Button>
      <Flex sx={{ variant: 'forms.search', width: '313px', ml: 'auto', alignItems: 'center' }}>
        <Icon
          sx={{ position: 'relative', top: '6px', ml: 3 }}
          name="search"
          size="4"
          color="muted"
        />
        <Input variant="plain" onChange={onChange} value={search} placeholder="Search" />
      </Flex>
    </Flex>
  )
}
export function FeaturedIlks({ ilks }: { ilks: FeaturedIlk[] }) {
  return (
    <Grid columns={['1fr', '1fr 1fr 1fr']} gap={4}>
      {ilks.map((ilk) => (
        <CallToAction key={ilk.title} ilk={ilk} />
      ))}
    </Grid>
  )
}

interface Props {
  vaultsOverView: VaultsOverview
  context: Context
  address: string
}
export function VaultsOverviewView({ vaultsOverView, context, address }: Props) {
  const { vaults, vaultSummary, featuredIlks, ilks } = vaultsOverView
  const { t } = useTranslation()

  const readonlyAccount = context?.status === 'connectedReadonly' && (address as string)
  const displayVaults =
    vaultSummary?.numberOfVaults !== undefined && vaultSummary?.numberOfVaults > 0
  const displayFeaturedIlks = vaults?.data.length === 0 && vaults.filters.tagFilter === undefined

  const onVaultSearch = useCallback(
    (search: string) => {
      vaults.filters.change({ kind: 'search', search })
    },
    [vaults.filters],
  )

  const onIlkSearch = useCallback(
    (search: string) => {
      ilks.filters.change({ kind: 'search', search })
    },
    [ilks.filters],
  )

  const onVaultsTagChange = useCallback(
    (tagFilter: CoinTag | undefined) => {
      vaults.filters.change({ kind: 'tagFilter', tagFilter })
    },
    [vaults.filters],
  )

  const onIlksTagChange = useCallback(
    (tagFilter: CoinTag | undefined) => {
      ilks.filters.change({ kind: 'tagFilter', tagFilter })
    },
    [ilks.filters],
  )

  return (
    <Grid sx={{ flex: 1 }}>
      {readonlyAccount && (
        <Card sx={{ width: 'max-content', p: 3, justifySelf: 'center', m: 3 }}>
          {t('readonly-alert-message')} {formatAddress(readonlyAccount)}
        </Card>
      )}
      <Heading variant="header2" sx={{ textAlign: 'center' }} as="h1">
        {t('vaults-overview.header')}
      </Heading>
      <Text variant="header3" sx={{ textAlign: 'center', justifySelf: 'center', mb: 4 }}>
        {context.status === 'connected'
          ? t('vaults-overview.message-connected', {
            address: formatAddress(address),
            count: vaultSummary?.numberOfVaults || 0,
          })
          : t('vaults-overview.message-not-connected', { address: formatAddress(address) })}
      </Text>
      {displayFeaturedIlks && featuredIlks && <FeaturedIlks ilks={featuredIlks} />}
      {displayVaults && vaultSummary && (
        <>
          <Summary summary={vaultSummary} />
          <Filters
            onSearch={onVaultSearch}
            search={vaults.filters.search}
            onTagChange={onVaultsTagChange}
            tagFilter={vaults.filters.tagFilter}
            defaultTag="your-vaults"
          />
          <VaultsTable vaults={vaults} />
        </>
      )}
      <Heading>Vaults</Heading>
      <Filters
        onSearch={onIlkSearch}
        search={ilks.filters.search}
        onTagChange={onIlksTagChange}
        tagFilter={ilks.filters.tagFilter}
        defaultTag="all-assets"
      />
      <AllIlks ilks={ilks} isReadonly={context?.status === 'connectedReadonly'} address={address} />
    </Grid>
  )
}
