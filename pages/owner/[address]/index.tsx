import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { Vault } from 'features/vaults/vault'
import { formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useMemo } from 'react'
import { Box, Grid, Heading, Text } from 'theme-ui'
import { Optional } from '../../../helpers/Optional'
import Link from 'next/link'

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
      <Box as='table' sx={{width: '100%'}}>
        <thead>
          <tr>
            {
              headerCells.map(header => <th>{header}</th>)
            }
          </tr>
        </thead>
        <tbody>
          {
            vaults.map(vault => (
            <tr key={vault.id}>
              <td>{vault.token}</td>
              <td>{vault.id}</td>
              <td>{vault.collateralizationRatio.toString()}</td>
              <td>{`${formatCryptoBalance(vault.collateral)} ${vault.token}`}</td>
              <td>{`${formatCryptoBalance(vault.collateralAvailable)} ${vault.token}`}</td>
              <td>{formatCryptoBalance(vault.debt)}</td>
              <td><Link href={`/${vault.id}`}>Menage Vault</Link></td>
            </tr>
            ))
          }
        </tbody>
      </Box>
    </Box>
  )
}

function Stat({name, children}: {name: string, children: React.ReactNode}) {
  return (
    <div>
      <div>{name}</div>
      {children}
    </div>
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
  const vaults = useObservable(vaults$(address))
  const totalCollateral = useMemo(() => vaults !== undefined 
  ? formatFiatBalance(getTotalCollateralPrice(vaults))
  : '$0'
  , [vaults])
  const totalDaiDebt = useMemo(() => 
    vaults !== undefined
      ? formatCryptoBalance(getTotalDaiDebt(vaults))
      : '0'
  , [vaults])

  return (
    <Grid sx={{flex: 1}}>
      <Heading as="h1">Overview</Heading>
      <Stat name="total collateral locked">
        {totalCollateral} USD
      </Stat>
      <Stat name="total dai debt">
        {totalDaiDebt} DAI
      </Stat>
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
