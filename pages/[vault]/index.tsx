import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
<<<<<<< HEAD
import { VaultView } from 'features/vaults/VaultView'
=======
import { VaultView } from 'features/vault/VaultView'
>>>>>>> 202eacab86cf9e8a9347770e35a4957bb8c14787
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import { Container } from 'theme-ui'

export default function Vault() {
  const { web3Context$, vault$ } = useAppContext()
  const web3Context = useObservable(web3Context$)

  const {
    query: { vault: vaultId },
  } = useRouter()

  const vault = useObservable(vault$(new BigNumber(vaultId as string)))

  const account = web3Context?.status === 'connected' 
    ? web3Context.account 
    : 'Not connected'

  if (vault === undefined) {
    return <div>No vault data</div>
  }

  return (
    <Container>
      <VaultView vault={vault} account={account} />
    </Container>
  )
}

Vault.layout = AppLayout
Vault.layoutProps = {
  backLink: {
    href: '/',
  },
}
