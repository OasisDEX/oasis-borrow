import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { AppLayout, BasicLayout } from 'components/Layouts'
import { useObservable } from 'helpers/observableHook'
import { Grid, Text } from 'theme-ui'
import { useRouter } from 'next/router'

const dudAddress = '0x746680A524E7Ec4b35c0c2cE5E406F7ea051e011'
function ProxyOwner({ proxyAddress }: { proxyAddress: string }) {
  const { proxyOwner$ } = useAppContext()

  const proxyOwner = useObservable(proxyOwner$(proxyAddress))

  return <Text>{proxyOwner}</Text>
}

export default function VaultsSummary() {
  const { web3Context$, proxyAddress$, proxyOwner$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const {
    query: { address },
  } = useRouter()

  const proxyAddress = useObservable(proxyAddress$(address))

  // const vaultsSummary = useObservable(vaultsSummary$(address))

  return (
    <Grid>
      <Text>Connected Address :: {web3Context?.account}</Text>
      <Text>Viewing Address :: {address}</Text>
      <Text>ProxyAddress :: {proxyAddress}</Text>
      <Text>ProxyOwner :: {proxyAddress ? <ProxyOwner {...{ proxyAddress }} /> : null}</Text>
    </Grid>
  )
}

VaultsSummary.layout = AppLayout
VaultsSummary.layoutProps = {
  backLink: {
    href: '/',
  },
}
