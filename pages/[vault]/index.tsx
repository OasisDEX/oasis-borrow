import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { VaultView } from 'components/VaultView'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import { Container } from 'theme-ui';
import { Balances } from '../../components/Balances'

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
      {vault?.owner && <Balances owner={vault.owner} />}  
      <VaultView vault={vault} account={account} />
    </Container>)
}

Vault.layout = AppLayout
Vault.layoutProps = {
  backLink: {
    href: '/',
  },
}
