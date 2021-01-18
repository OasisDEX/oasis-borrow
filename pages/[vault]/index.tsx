import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import { Grid, Text } from 'theme-ui'

function Balances({ owner }: { owner: string }) {
  const { balances$ } = useAppContext()
  const balances = useObservable(balances$(owner))
  console.log('balances', owner, balances)
  return <Text as="pre">{JSON.stringify(balances, null, 2)}</Text>
}

export default function Vault() {
  const { web3Context$, vault$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const {
    query: { vault },
  } = useRouter()

  const theVault = useObservable(vault$(new BigNumber(vault as any)))

  console.log('theVault', theVault)

  if(!theVault) {
    return null
  }

  return (
    <Grid>
      <Text>Connected Address :: {web3Context?.account}</Text>
      <Text>VaultId :: {vault}</Text>
      <Text as="pre">{JSON.stringify(theVault, null, 2)}</Text>
      {theVault?.owner && <Balances owner={theVault.owner} />}
    </Grid>
  )
}

Vault.layout = AppLayout
Vault.layoutProps = {
  backLink: {
    href: '/',
  },
}
