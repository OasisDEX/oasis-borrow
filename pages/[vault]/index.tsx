import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import { Grid, Text } from 'theme-ui'

export default function Vault() {
  const { web3Context$ } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const {
    query: { vault },
  } = useRouter()

  return (
    <Grid>
      <Text>Connected Address :: {web3Context?.account}</Text>
      <Text>Vault :: {vault}</Text>
    </Grid>
  )
}

Vault.layout = AppLayout
Vault.layoutProps = {
  backLink: {
    href: '/',
  },
}
