import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { IlkWithBalance } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { AppLink } from 'components/Links'
import { ColumnDef, Table, TableSortHeader } from 'components/Table'
import {
  formatAddress,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import React, { memo, useCallback, useMemo } from 'react'
import { Box, Button, Card, Flex, Grid, Heading, Input, Label, Radio, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { IlksWithFilters } from '../ilks/ilksFilters'
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
    headerLabel: 'system.collateral',
    header: ({ label, ...filters }) => <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateral">
      {label}
    </TableSortHeader>,
    cell: ({ lockedCollateral }) => (
      <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(lockedCollateral)}</Text>
    ),
  },
  {
    headerLabel: 'system.freeCollateral',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="freeCollateral">
        {label}
      </TableSortHeader>),
    cell: ({ freeCollateral }) => (
      <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(freeCollateral)}</Text>
    ),
  },
  {
    headerLabel: 'system.debt',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="debt">
        {label}
      </TableSortHeader>),
    cell: ({ debt }) => (
      <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(debt)}</Text>
    ),
  },
  {
    headerLabel: 'system.collateralizationRatio',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateralizationRatio">
        {label}
      </TableSortHeader>),
    cell: ({ collateralizationRatio }) => (
      <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(collateralizationRatio)}</Text>
    ),
  },
  {
    headerLabel: 'system.collateralizationRatio',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateralizationRatio">
        {label}
      </TableSortHeader>),
    cell: ({ collateralizationRatio }) => (
      <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(collateralizationRatio)}</Text>
    ),
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
    )
  }
]
function VaultsTable({ vaults }: { vaults: VaultsWithFilters }) {
  const { data, filters } = vaults
  return (
    <Table
      data={data}
      primaryKey="id"
      state={filters}
      columns={vaultsColumns}
    //   {
    //     header: <Text />,
    //     cell: ({ id }) => (
    //       <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
    //         <AppLink
    //           sx={{ width: ['100%', 'inherit'], textAlign: 'center' }}
    //           variant="secondary"
    //           as={`/${id}`}
    //           href={`/[vault]`}
    //         >
    //           Manage Vault
    //         </AppLink>
    //       </Box>
    //     ),
    //   },
    // ]}
    />
  )
}

const VaultsTableMemo = memo(VaultsTable);

const Header = ({ header }: { header: string }) => <Text variant="tableHead">{header}</Text>
function AllIlks({
  ilks,
  isReadonly,
}: {
  ilks: IlksWithFilters
  isReadonly: boolean
  address: string
}) {
  const { data, filters } = ilks

  const rowDef = useMemo(() => [
    {
      header: <Text variant="tableHead">Asset</Text>,
      cell: ({ token }) => <TokenSymbol token={token} />,
    },
    {
      header: <Text variant="tableHead">Type</Text>,
      cell: ({ ilk }) => <Text>{ilk}</Text>,
    },
    {
      header: (
        <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="ilkDebtAvailable">
          DAI Available
        </TableSortHeader>
      ),
      cell: ({ ilkDebtAvailable }) => (
        <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(ilkDebtAvailable)}</Text>
      ),
    },
    {
      header: (
        <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="stabilityFee">
          Stability Fee
        </TableSortHeader>
      ),
      cell: ({ stabilityFee }) => (
        <Text sx={{ textAlign: 'right' }}>{formatPercent(stabilityFee.times(100))}</Text>
      ),
    },
    {
      header: (
        <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="liquidationRatio">
          Min. Coll Rato
        </TableSortHeader>
      ),
      cell: ({ liquidationRatio }) => (
        <Text sx={{ textAlign: 'right' }}>{formatPercent(liquidationRatio.times(100))}</Text>
      ),
    },
    ...(isReadonly
      ? []
      : [
        {
          header: (
            <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="balance">
              In my wallet
            </TableSortHeader>
          ),
          cell: (ilk: IlkWithBalance) => (
            <Flex sx={{ alignItems: 'baseline', justifyContent: 'flex-end' }}>
              <Text sx={{ textAlign: 'right' }}>
                {ilk.balance ? formatCryptoBalance(ilk.balance) : 0}
              </Text>
              <Text variant="paragraph3" sx={{ color: 'muted', ml: 1 }}>
                {`($${ilk.balancePriceInUsd ? formatFiatBalance(ilk.balancePriceInUsd) : 0})`}
              </Text>
            </Flex>
          ),
        },
      ]),
    {
      header: <Text />,
      cell: ({ ilk }) => (
        <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
          <AppLink
            sx={{ width: ['100%', 'inherit'], textAlign: 'center' }}
            variant="secondary"
            href={`/vaults/open/${ilk}`}
          >
            Open Vault
          </AppLink>
        </Box>
      ),
    },
  ], [filters])

  return (
    <Table
      primaryKey="ilk"
      data={data}
      columns={rowDef}
    />
  )
}

const AllIlksMemo = memo(AllIlks)

interface CallToActionProps {
  ilk: FeaturedIlk
}
function CallToAction({ ilk }: CallToActionProps) {
  const token = getToken(ilk.token)

  return (
    <AppLink href={`/vaults/open/${ilk.ilk}`}>
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
            Stability fee:
          </Text>
          <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>
            {formatPercent(ilk.stabilityFee)}
          </Text>
        </Flex>
        <Flex>
          <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>
            Min coll ratio:
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
  return (
    <Card>
      <Grid columns="repeat(4, 1fr)">
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            No. of Vaults
          </Text>
          <Text variant="header2">{summary.numberOfVaults}</Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            Total locked
          </Text>
          <Text variant="header2">${formatCryptoBalance(summary.totalCollateralPrice)}</Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            Total Debt
          </Text>
          <Text variant="header2">{formatCryptoBalance(summary.totalDaiDebt)} DAI</Text>
        </Box>
        <Box>
          <Text variant="paragraph2" sx={{ color: 'text.muted' }}>
            Vaults at Risk
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
  onSearch: (search: string) => void,
  onTagChange: (tag: CoinTag | undefined) => void,
  search: string
  tagFilter: CoinTag | undefined
}

function Filters({ onSearch, search, onTagChange, tagFilter }: FiltersProps) {
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.currentTarget.value)
  }, [onSearch])

  return (
    <Flex>
      <Button onClick={() => onTagChange(undefined)} sx={{ mr: 2 }} data-selected={tagFilter === undefined} variant="filter">Your Vaults</Button>
      <Button onClick={() => onTagChange('stablecoin')} sx={{ mr: 2 }} data-selected={tagFilter === 'stablecoin'} variant="filter">Stablecoins</Button>
      <Button onClick={() => onTagChange('LPToken')} sx={{ mr: 2 }} data-selected={tagFilter === 'LPToken'} variant="filter">LP Vaults</Button>
      <Flex sx={{ variant: 'forms.search', width: "313px", ml: 'auto', alignItems: 'center' }}>
        <Icon sx={{ position: 'relative', top: "3px", left: '3px', mx: 2 }} name="search" size="4" color="muted" />
        <Input variant="plain" onChange={onChange} value={search} placeholder="Search" />
      </Flex>
    </Flex>)
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

  const readonlyAccount = context?.status === 'connectedReadonly' && (address as string)
  const displaySummary = vaults && vaults.data.length > 0 && vaultSummary
  const displayFeaturedIlks = vaults?.data.length === 0 && featuredIlks
  const displayVaults = vaults && vaults.data.length > 0 && vaults

  const onVaultSearch = useCallback((search: string) => {
    vaults.filters.change({ kind: 'search', search })
  }, [vaults.filters])

  const onTagChange = useCallback((tagFilter: CoinTag | undefined) => {
    vaults.filters.change({ kind: 'tagFilter', tagFilter })
  }, [vaults.filters])

  return (
    <Grid sx={{ flex: 1 }}>
      {readonlyAccount && (
        <Card sx={{ width: 'max-content', p: 3, justifySelf: 'center', m: 3 }}>
          Viewing {formatAddress(readonlyAccount)}
        </Card>
      )}
      <Heading variant="header2" sx={{ textAlign: 'center' }} as="h1">
        Vault overview
      </Heading>
      <Text variant="header3" sx={{ textAlign: 'center', justifySelf: 'center', mb: 4 }}>
        Hello 0x..102s it looks like tou currently have no Vaults open with this wallet. Open a
        Vault below.
      </Text>
      {displaySummary && <Summary summary={displaySummary} />}
      {displayFeaturedIlks && <FeaturedIlks ilks={displayFeaturedIlks} />}
      {displayVaults && (
        <>
          <Filters
            onSearch={onVaultSearch}
            search={vaults.filters.search}
            onTagChange={onTagChange}
            tagFilter={vaults.filters.tagFilter}
          />
          <VaultsTable vaults={displayVaults} />
        </>
      )}
      {ilks && (
        <>
          <Heading>Vaults</Heading>
          {/* <AllIlks
            ilks={ilks}
            isReadonly={context?.status === 'connectedReadonly'}
            address={address}
          /> */}
        </>
      )}
    </Grid>
  )
}
