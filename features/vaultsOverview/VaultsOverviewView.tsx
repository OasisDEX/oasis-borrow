import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { IlkWithBalance } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { AppLink } from 'components/Links'
import { Table, TableSortHeader } from 'components/Table'
import { VaultSummary } from 'features/vault/vaultSummary'
import { formatAddress, formatCryptoBalance, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import React from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { TokenSymbol } from '../landing/LandingView'
import { IlksWithFilters } from './ilksFilters'
import { VaultsWithFilters } from './vaultsFilters'
import { FeaturedIlk, VaultsOverview } from './vaultsOverview'

function VaultsTable({ vaults }: { vaults: VaultsWithFilters }) {
  const { data, filters } = vaults
  return (
    <Table
      data={data}
      primaryKey="id"
      rowDefinition={[
        {
          header: <Text variant="tableHead">Asset</Text>,
          cell: ({ token }) => <TokenSymbol token={token} />,
        },
        {
          header: <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="collateral">Deposited</TableSortHeader>,
          cell: ({ collateral }) => (
            <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(collateral)}</Text>
          ),
        },
        {
          header: <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy='freeCollateral'>Avail. to withdraw</TableSortHeader>,
          cell: ({ freeCollateral }) => (
            <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(freeCollateral)}</Text>
          ),
        },
        {
          header: <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy='debt'>DAI</TableSortHeader>,
          cell: ({ debt }) => <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(debt)}</Text>,
        },
        {
          header: <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy='collateralizationRatio'>Current Ratio</TableSortHeader>,
          cell: ({ collateralizationRatio }) => (
            <Text sx={{ textAlign: 'right' }}>
              {collateralizationRatio ? formatPercent(collateralizationRatio.times(100)) : 0}
            </Text>
          ),
        },
        {
          header: <Text />,
          cell: ({ id }) => (
            <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
              <AppLink sx={{ width: ['100%', 'inherit'], textAlign: 'center' }} variant="secondary" as={`/${id}`} href={`/[vault]`}>
                Manage Vault
              </AppLink>
            </Box>
          ),
        },
      ]}
    />
  )
}

function AllIlks({
  canOpenVault,
  ilks,
  isReadonly,
}: {
  canOpenVault: boolean
  ilks: IlksWithFilters
  isReadonly: boolean
  address: string,
}) {
  const { data, filters } = ilks
  return (
    <Table
      primaryKey="ilk"
      data={data}
      rowDefinition={[
        {
          header: <Text variant="tableHead">Asset</Text>,
          cell: ({ token }) => <TokenSymbol token={token} />,
        },
        {
          header: <Text variant="tableHead">Type</Text>,
          cell: ({ ilk }) => <Text>{ilk}</Text>,
        },
        {
          header: <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="ilkDebtAvailable">DAI Available</TableSortHeader>,
          cell: ({ ilkDebtAvailable }) => (
            <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(ilkDebtAvailable)}</Text>
          ),
        },
        {
          header: <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="stabilityFee" >Stability Fee</TableSortHeader>,
          cell: ({ stabilityFee }) => (
            <Text sx={{ textAlign: 'right' }}>{formatPercent(stabilityFee.times(100))}</Text>
          ),
        },
        {
          header: <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="liquidationRatio">Min. Coll Rato</TableSortHeader>,
          cell: ({ liquidationRatio }) => (
            <Text sx={{ textAlign: 'right' }}>{formatPercent(liquidationRatio.times(100))}</Text>
          ),
        },
        ...(isReadonly
          ? []
          : [
            {
              header: <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="balance">In my wallet</TableSortHeader>,
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
              <AppLink sx={{ width: ['100%', 'inherit'], textAlign: 'center' }} variant="secondary" href={`/vaults/open/${ilk}`}>
                Open Vault
              </AppLink>
            </Box>
          ),
        },
      ]}
    />
  )
}

interface CallToActionProps {
  ilk: FeaturedIlk
}
function CallToAction({ ilk }: CallToActionProps) {
  const token = getToken(ilk.token)

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

export function FeaturedIlks({ ilks }: { ilks: FeaturedIlk[] }) {
  return (
    <Grid columns="1fr 1fr 1fr" gap={4}>
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
  const {
    vaults,
    vaultSummary,
    featuredIlks,
    ilks,
    canOpenVault,
  } = vaultsOverView

  const readonlyAccount = context?.status === 'connectedReadonly' && (address as string)
  const displaySummary = vaults && vaults.data.length > 0 && vaultSummary
  const displayFeaturedIlks = vaults?.data.length === 0 && featuredIlks
  const displayVaults = vaults && vaults.data.length > 0 && vaults

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
          <Heading>{readonlyAccount ? `Address Vaults` : 'Your Vaults'}</Heading>
          <VaultsTable vaults={displayVaults} />
        </>
      )}
      {ilks && (
        <>
          <Heading>Vaults</Heading>
          <AllIlks
            canOpenVault={canOpenVault}
            ilks={ilks}
            isReadonly={context?.status === 'connectedReadonly'}
            address={address}
          />
        </>
      )}
    </Grid>
  )
}
