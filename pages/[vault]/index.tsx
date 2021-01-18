import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { VaultView } from 'components/VaultView'
import { formatCryptoBalance, formatFiatBalance, formatPercent, formatPrecision } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import { Box,Button, Grid, Heading, Text } from 'theme-ui'

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
    query: { vault: vaultId },
  } = useRouter()

  const vault = useObservable(vault$(new BigNumber(vaultId as string)))

  const account = web3Context?.status === 'connected' 
    ? web3Context.account
    : 'Not connected'

  if (vault === undefined) {
    return <div>No vault data</div>
  }
  
  return <VaultView vault={vault} account={account} />
}

Vault.layout = AppLayout
Vault.layoutProps = {
  backLink: {
    href: '/',
  },
}
