import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { AppLayout, BasicLayout } from 'components/Layouts'
import { useObservable } from 'helpers/observableHook'
import { Grid, Text } from 'theme-ui'
import { useRouter } from 'next/router'

export default function VaultsSummary() {
  const { web3Context$, proxyAddress$ } = useAppContext()
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
    </Grid>
  )
}

VaultsSummary.layout = AppLayout
VaultsSummary.layoutProps = {
  backLink: {
    href: '/',
  },
}
