import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { AppLayout, BasicLayout } from 'components/Layouts'
import { useObservable } from 'helpers/observableHook'
import { Box, Grid, Text } from 'theme-ui'
import { VaultSummary } from 'features/vaultsSummary/vaultsSummary'

function ProxyOwner({ proxyAddress }: { proxyAddress: string }) {
  const { proxyOwner$ } = useAppContext()

  const proxyOwner = useObservable(proxyOwner$(proxyAddress))

  return <Text>{proxyOwner}</Text>
}

function VaultsTable({ vaultsSummary }: { vaultsSummary: VaultSummary[] }) {
  return (
    <Box>
      <Text sx={{ fontSize: 4 }}>Vaults ::</Text>
      <Grid columns={[2]} pt={3}>
        <Text>VaultId</Text>
        <Text>VaultType</Text>

        {vaultsSummary.map((vault) => (
          <>
            <Text>{vault.id}</Text>
            <Text>{vault.type}</Text>
          </>
        ))}
      </Grid>
    </Box>
  )
}

function Summary({ address }: { address: string }) {
  const { web3Context$, proxyAddress$, proxyOwner$, vaultsSummary$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const proxyAddress = useObservable(proxyAddress$(address))
  const vaultsSummary = useObservable(vaultsSummary$(address))

  return (
    <Grid>
      <Text>Connected Address :: {web3Context?.account}</Text>
      <Text>Viewing Address :: {address}</Text>
      <Text>ProxyAddress :: {proxyAddress}</Text>
      <Text>ProxyOwner :: {proxyAddress ? <ProxyOwner {...{ proxyAddress }} /> : null}</Text>
      {vaultsSummary ? <VaultsTable {...{ vaultsSummary }} /> : null}
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
  backLink: {
    href: '/',
  },
}
