import BigNumber from 'bignumber.js'
import { IlkDataList } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { OpenVaultModal } from 'features/openVault/openVaultModalView'
import { VaultSummary } from 'features/vault/vaultSummary'
import { formatAddress, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { Box, Button, Card, Flex, Grid, Heading, Text } from 'theme-ui'
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
          <Table.Cell sx={{ textAlign: 'right' }}>{`${formatCryptoBalance(vault.collateral)} ${
            vault.token
          }`}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>{`${formatCryptoBalance(vault.freeCollateral)} ${
            vault.token
          }`}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>{formatCryptoBalance(vault.debt)}</Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            {vault.collateralizationRatio
              ? formatPercent(vault.collateralizationRatio.times(100))
              : 0}
          </Table.Cell>
          <Table.Cell sx={{ textAlign: 'right' }}>
            <AppLink
              sx={{ lineHeight: 1 }}
              variant="buttons.outline"
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
  const openModal = useModal()

  function handleVaultOpen(ilk: string) {
    return (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault()
      openModal(OpenVaultModal, { ilk })
    }
  }

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
            <Button
              sx={{ lineHeight: 1 }}
              variant="outline"
              disabled={!canOpenVault}
              onClick={handleVaultOpen(ilk)}
            >
              Open Vault
            </Button>
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
        <Text>{ilk.title}</Text>
      </Box>
      <Box sx={{ gridColumn: '1/3' }}>
        <Text variant="heading" sx={{ color: 'white' }}>
          {ilk.ilk}
        </Text>
      </Box>
      <Box>
        <Text variant="boldBody">Stability fee:</Text>
        <Text variant="small">{formatPercent(ilk.stabilityFee)}</Text>
      </Box>
      <Box>
        <Text variant="boldBody">Min coll ratio:</Text>
        <Text variant="small">{formatPercent(ilk.liquidationRatio)}</Text>
      </Box>
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

  const readonlyAccount = context?.status === 'connected' && context.readonly && context.account
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
      <Heading sx={{ textAlign: 'center', fontSize: 7 }} as="h1">
        Vault overview
      </Heading>
      <Text sx={{ textAlign: 'center', justifySelf: 'center', width: 700, fontSize: 4, mb: 4 }}>
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
