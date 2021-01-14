import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { Vault } from 'features/vaults/vault'
import { formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import Link from 'next/link'
import { useMemo } from 'react'
import { Box, Grid, Heading, Text } from 'theme-ui'

function ProxyOwner({ proxyAddress }: { proxyAddress: string }) {
  const { proxyOwner$ } = useAppContext()

  const proxyOwner = useObservable(proxyOwner$(proxyAddress))

  return <Text>{proxyOwner}</Text>
}

function VaultsTable({ vaults }: { vaults: Vault[] }) {
  const headerCells = [
    'token',
    'vault id',
    'current ratio',
    'deposited',
    'avail. to withdraw',
    'dai'
  ]
  return (
    <Box>
      <Box as='table' sx={{ width: '100%' }}>
        <Box as="thead">
          <Box as="tr">
            {
              headerCells.map(header => <Box as="th">{header}</Box>)
            }
          </Box>
        </Box>
        <Box as="tbody">
          {
            vaults.map(vault => (
            <Box as="tr" key={vault.id}>
              <Box as="td">{vault.token}</Box>
              <Box as="td">{vault.id}</Box>
              <Box as="td">{vault.collateralizationRatio.toString()}</Box>
              <Box as="td">{`${formatCryptoBalance(vault.collateral)} ${vault.token}`}</Box>
              <Box as="td">{`${formatCryptoBalance(vault.collateralAvailable)} ${vault.token}`}</Box>
              <Box as="td">{formatCryptoBalance(vault.debt)}</Box>
              <Box as="td"><Link href={`/${vault.id}`}>Menage Vault</Link></Box>
            </Box>
            ))
          }
        </Box>
      </Box>
    </Box>
  )
}

function getTotalCollateralPrice(vaults: Vault[]) {
  return vaults.reduce((total, vault) => total.plus(vault.collateralPrice), new BigNumber(0))
}

function getTotalDaiDebt(vaults: Vault[]) {
  return vaults.reduce((total, vault) => total.plus(vault.debt), new BigNumber(0))
}

function Summary({ address }: { address: string }) {
  const { web3Context$, proxyAddress$, vaults$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const proxyAddress = useObservable(proxyAddress$(address))
  const vaultsData$ = vaults$(address)
  const vaults = useObservable(vaultsData$)
  const totalCollateral = useMemo(() => vaults !== undefined 
  ? formatFiatBalance(getTotalCollateralPrice(vaults))
  : '$0'
  , [vaults])
  const totalDaiDebt = useMemo(() => 
    vaults !== undefined
      ? formatCryptoBalance(getTotalDaiDebt(vaults))
      : '0'
  , [vaults])

  console.log('vaults', vaults)

  return (
    <Grid sx={{ flex: 1 }}>
      <Heading as="h1">Overview</Heading>
      <Box>
        <Heading as="h2">Total collateral locked</Heading>
        <Box>{totalCollateral} USD</Box>
      </Box>
      <Box>
        <Heading as="h2">Total dai debt</Heading>
        <Box>{totalDaiDebt} DAI</Box>
      </Box>
      <Text>Connected Address :: {(web3Context as any)?.account}</Text>
      <Text>Viewing Address :: {address}</Text>
      <Text>ProxyAddress :: {proxyAddress}</Text>
      <Text>ProxyOwner :: {proxyAddress ? <ProxyOwner proxyAddress={proxyAddress} /> : null}</Text>
      <Heading as="h2">Your Vaults:</Heading>
      {vaults && <VaultsTable vaults={vaults} />}
    </Grid>
  )
}

export default function VaultsSummary() {
  const { readonlyAccount$ } = useAppContext()

  const address = useObservable(readonlyAccount$)
  return address ? <Summary {...{ address }} /> : null
}

VaultsSummary.layout = AppLayout
VaultsSummary.layoutProps = {
  variant: 'daiContainer',
  backLink: {
    href: '/',
  },
}
