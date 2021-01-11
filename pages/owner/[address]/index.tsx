import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { Vault } from 'features/vaultsSummary/vaultsSummary'
import { useObservable } from 'helpers/observableHook'
import { Box, Grid, Text } from 'theme-ui'

function ProxyOwner({ proxyAddress }: { proxyAddress: string }) {
  const { proxyOwner$ } = useAppContext()

  const proxyOwner = useObservable(proxyOwner$(proxyAddress))

  return <Text>{proxyOwner}</Text>
}

function VaultsTable({ vaults }: { vaults: Vault[] }) {
  return (
    <Box>
      <Text sx={{ fontSize: 4 }}>Vaults ::</Text>
      <Grid columns={[2]} pt={3}>
        <Text>VaultId</Text>
        <Text>VaultType</Text>

        {vaults.map((vault) => (
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
  const { web3Context$, proxyAddress$, vaults$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const proxyAddress = useObservable(proxyAddress$(address))
  const vaults = useObservable(vaults$(address))

  return (
    <Grid>
      <Text>Connected Address :: {(web3Context as any)?.account}</Text>
      <Text>Viewing Address :: {address}</Text>
      <Text>ProxyAddress :: {proxyAddress}</Text>
      <Text>ProxyOwner :: {proxyAddress ? <ProxyOwner {...{ proxyAddress }} /> : null}</Text>
      {vaults ? <VaultsTable {...{ vaults }} /> : null}
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
