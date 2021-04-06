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
import { Trans, useTranslation } from 'next-i18next'
import React, { useCallback, useMemo } from 'react'
import { Box, Card, Flex, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { IlksFilterState, IlksWithFilters } from '../ilks/ilksFilters'
import { TokenSymbol } from '../landing/LandingView'
import { VaultsFilterState, VaultsWithFilters } from './vaultsFilters'
import { FeaturedIlk, VaultsOverview } from './vaultsOverview'
import { VaultSummary } from './vaultSummary'
import { Filters } from './Filters'

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
    cell: ({ id }) => <Text>#{id.toString()}</Text>,
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
  return <Table data={data} primaryKey="address" state={filters} columns={vaultsColumns} />
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

function CallToActionPlaceholder() {
  return (
    <Grid
      columns="1fr 1fr"
      gap={0}
      sx={{
        flex: 1,
        cursor: 'pointer',
        bg: 'ghost',
        borderRadius: 'large',
        p: 4,
        position: 'relative',
        boxShadow: 'surface',
        gridTemplateRows: 'auto 1fr auto',
        backgroundBlendMode: 'overlay',
        opacity: 0.3,
        color: 'transparent',
      }}
    >
      <Box sx={{ gridColumn: '1/3', zIndex: 1, }}>
        <Text variant="caption">title</Text>
      </Box>
      <Box sx={{ gridColumn: '1/3', zIndex: 1 }}>
        <Heading variant="header2" sx={{ color: 'transparent', minHeight: '100px' }}>
          ilk
          </Heading>
      </Box>
      <Flex sx={{ zIndex: 1 }}>
        <Text variant="paragraph3" sx={{ color: 'transparent', mr: 2 }}>
          fee
          </Text>
      </Flex>
      <Flex sx={{ zIndex: 1, gridRow: [3, 4, 3] }}>
        <Text variant="paragraph3" sx={{ color: 'transparent', mr: 2 }}>
          'ratio'
        </Text>
      </Flex>
    </Grid>
  )
}
function CallToAction({ ilk }: CallToActionProps) {
  const token = getToken(ilk.token)
  const { t } = useTranslation()

  return (
    <AppLink href={`/vaults/open/${ilk.ilk}`}>
      <Grid
        columns="1fr 1fr"
        gap={0}
        sx={{
          flex: 1,
          cursor: 'pointer',
          background: token.background,
          borderRadius: 'large',
          p: 4,
          color: 'white',
          position: 'relative',
          boxShadow: 'surface',
          gridTemplateRows: 'auto 1fr auto',
        }}
      >
        <Image
          sx={{
            maxWidth: '150%',
            position: 'absolute',
            userSelect: 'none',
            transform: 'scale(1.05)',
            right: 0,
          }}
          src={token.bannerIcon}
        />
        <Box sx={{ gridColumn: '1/3', zIndex: 1 }}>
          <Text variant="caption">{ilk.title}</Text>
        </Box>
        <Box sx={{ gridColumn: '1/3', zIndex: 1 }}>
          <Heading variant="header2" sx={{ color: 'white', minHeight: '100px' }}>
            {ilk.ilk}
          </Heading>
        </Box>
        <Flex sx={{ zIndex: 1 }}>
          <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>
            {t('system.stability-fee')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>
            {formatPercent(ilk.stabilityFee)}
          </Text>
        </Flex>
        <Flex sx={{ zIndex: 1, gridRow: [3, 4, 3] }}>
          <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>
            {t('system.min-coll-ratio')}
          </Text>
          <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>
            {formatPercent(ilk.liquidationRatio)}
          </Text>
        </Flex>
      </Grid>
    </AppLink>
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

export function FeaturedIlks({ ilks, sx }: { ilks: FeaturedIlk[], sx?: SxStyleProp }) {
  return (
    <Grid sx={sx} columns={['1fr', '1fr 1fr 1fr']} gap={4}>
      {ilks.map((ilk) => (
        <CallToAction key={ilk.title} ilk={ilk} />
      ))}
    </Grid>
  )
}

export function FeaturedIlksPlaceholder() {
  return (
    <Grid sx={{ position: 'absolute', left: 0, top: 0, right: 0 }} columns={['1fr', '1fr 1fr 1fr']} gap={4}>
      <CallToActionPlaceholder />
      <CallToActionPlaceholder />
      <CallToActionPlaceholder />
    </Grid>
  )
}

interface Props {
  vaultsOverview: VaultsOverview
  context: Context
  address: string
}
export function VaultsOverviewView({ vaultsOverview, context, address }: Props) {
  const { vaults, vaultSummary, featuredIlks, ilksWithFilters } = vaultsOverview
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
      ilksWithFilters.filters.change({ kind: 'search', search })
    },
    [ilksWithFilters.filters],
  )

  const onVaultsTagChange = useCallback(
    (tagFilter: CoinTag | undefined) => {
      vaults.filters.change({ kind: 'tagFilter', tagFilter })
    },
    [vaults.filters],
  )

  const onIlksTagChange = useCallback(
    (tagFilter: CoinTag | undefined) => {
      ilksWithFilters.filters.change({ kind: 'tagFilter', tagFilter })
    },
    [ilksWithFilters.filters],
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
        search={ilksWithFilters.filters.search}
        onTagChange={onIlksTagChange}
        tagFilter={ilksWithFilters.filters.tagFilter}
        defaultTag="all-assets"
      />
      <AllIlks
        ilks={ilksWithFilters}
        isReadonly={context?.status === 'connectedReadonly'}
        address={address}
      />
    </Grid>
  )
}
