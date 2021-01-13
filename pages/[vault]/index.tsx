import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import { Grid, Text } from 'theme-ui'

export default function Vault() {
  const { web3Context$, vault$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const {
    query: { vault },
  } = useRouter()

  const theVault = useObservable(vault$(new BigNumber(vault as any)))

  console.log('theVault', theVault)

  return (
    <Grid>
      <Text>Connected Address :: {web3Context?.account}</Text>
      <Text>VaultId :: {vault}</Text>
      <Text>{JSON.stringify(theVault, null, '  ')}</Text>
    </Grid>
  )
}

Vault.layout = AppLayout
Vault.layoutProps = {
  backLink: {
    href: '/',
  },
}
