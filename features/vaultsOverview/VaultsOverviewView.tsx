import BigNumber from 'bignumber.js'
import { IlkDataList } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { VaultSummary } from 'features/vault/vaultSummary'
import { formatAddress, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import React from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'
import { Dictionary } from 'ts-essentials'

import { Table, TokenSymbol } from '../landing/LandingView'
import { FeaturedIlk, VaultsOverview } from './vaultsOverview'

function VaultsTable({ vaults }: { vaults: Vault[] }) {
  return (
    <Table
      header={
        <>
          <Table.Header>Asset</Table.Header>
          <Table.Header>Type</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Deposited</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Avail. to withdraw</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>DAI</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Current Ratio</Table.Header>
          <Table.Header></Table.Header>
        </>
      }
    >
      {vaults.map((vault) => (
        <Table.Row key={vault.id}>
          <Table.Cell>
            <TokenSymbol token={vault.token} />
          </Table.Cell>
          <Table.Cell>{vault.ilk}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>{`${formatCryptoBalance(vault.collateral)} ${vault.token
            }`}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>{`${formatCryptoBalance(vault.freeCollateral)} ${vault.token
            }`}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>{formatCryptoBalance(vault.debt)}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            {vault.collateralizationRatio
              ? formatPercent(vault.collateralizationRatio.times(100))
              : 0}
          </Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            <AppLink
              variant="secondary"
              as={`/${vault.id}`}
              href={`/[vault]`}
            >
              Manage Vault
            </AppLink>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table>
  )
}

function AllIlks({
  canOpenVault,
  ilkDataList,
}: {
  canOpenVault: boolean
  ilkDataList: IlkDataList
}) {

  return (
    <Table
      header={
        <>
          <Table.Header>Asset</Table.Header>
          <Table.Header>Type</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>DAI Available</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Stability Fee</Table.Header>
          <Table.Header sx={{ textAlign: 'right' }}>Min. Coll Rato</Table.Header>
          <Table.Header></Table.Header>
        </>
      }
    >
      {ilkDataList.map(({ ilk, token, ilkDebtAvailable, stabilityFee, liquidationRatio }) => (
        <Table.Row key={ilk}>
          <Table.Cell>
            <TokenSymbol token={token} />
          </Table.Cell>
          <Table.Cell>{ilk}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            {formatCryptoBalance(ilkDebtAvailable)}
          </Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            {formatPercent(stabilityFee.times(100))}
          </Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            {formatPercent(liquidationRatio.times(100))}
          </Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            <AppLink
              variant="secondary"
              disabled={!canOpenVault}
              href={`/vaults/open/${ilk}`}
            >
              Open Vault
            </AppLink>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table>
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
        <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }} >Stability fee:</Text>
        <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>{formatPercent(ilk.stabilityFee)}</Text>
      </Flex>
      <Flex>
        <Text variant="paragraph3" sx={{ color: 'white', mr: 2 }}>Min coll ratio:</Text>
        <Text variant="paragraph3" sx={{ color: 'white', fontWeight: 'semiBold' }}>{formatPercent(ilk.liquidationRatio)}</Text>
      </Flex>
    </Grid>
  )
}
function Summary({ summary }: { summary: VaultSummary }) {
  return (
    <Card>
      <Grid columns="repeat(4, 1fr)">
        <Box>
          <Text sx={{ color: 'text.muted' }}>No. of Vaults</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 6 }}>{summary.numberOfVaults}</Text>
        </Box>
        <Box>
          <Text sx={{ color: 'text.muted' }}>Total locked</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 6 }}>
            ${formatCryptoBalance(summary.totalCollateralPrice)}
          </Text>
        </Box>
        <Box>
          <Text sx={{ color: 'text.muted' }}>Total Debt</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 6 }}>
            {formatCryptoBalance(summary.totalDaiDebt)} DAI
          </Text>
        </Box>
        <Box>
          <Text sx={{ color: 'text.muted' }}>Vaults at Risk</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 6 }}>{summary.vaultsAtRisk}</Text>
        </Box>
        <Graph assetRatio={summary.depositedAssetRatio} />
      </Grid>
    </Card>
  )
}

function Graph({ assetRatio }: { assetRatio: Dictionary<BigNumber> }) {
  const assets = Object.entries(assetRatio).sort(([, a], [, b]) => b.comparedTo(a))

  return (
    <Box sx={{ gridColumn: '1/5', my: 3 }}>
      <Flex>
        {assets.map(([token, ratio]) => (
          <Box
            key={token}
            sx={{
              flex: ratio.toString(),
              height: '5px',
              background: getToken(token).color || 'gray',
            }}
          />
        ))}
      </Flex>
      <Flex>
        {assets.map(([token, ratio]) => (
          <Box key={token} sx={{ my: 2, flex: ratio.toString() }}>
            {ratio.gt(0.08) && (
              <Flex sx={{ flexDirection: 'column' }}>
                <TokenSymbol token={token} />
                <Text sx={{ ml: '28px', fontSize: 1, color: 'text.muted' }}>
                  {formatPercent(ratio.times(100), { precision: 2 })}
                </Text>
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

export function VaultsOverviewView({
  canOpenVault,
  vaults,
  ilkDataList,
  vaultSummary,
  featuredIlks,
}: VaultsOverview) {
  const { context$ } = useAppContext()
  const context = useObservable(context$)
  const { query: { address } } = useRouter()

  const readonlyAccount = context?.status === 'connectedReadonly' && address as string
  const displaySummary = vaults && vaults.length > 0 && vaultSummary
  const displayFeaturedIlks = vaults?.length === 0 && featuredIlks
  const displayVaults = vaults && vaults.length > 0 && vaults

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
      {ilkDataList && (
        <>
          <Heading>Vaults</Heading>
          <AllIlks canOpenVault={canOpenVault} ilkDataList={ilkDataList} />
        </>
      )}
    </Grid>
  )
}
