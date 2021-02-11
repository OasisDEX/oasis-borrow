import React, { useEffect } from 'react'
import { AppLayout } from 'components/Layouts'
import { useRouter } from 'next/router'
import { OpenVaultView } from 'features/openVault/openVaultView'
import { useAppContext } from 'components/AppContextProvider'
import { getConnector } from 'components/connectWallet/ConnectWallet'
import { getNetworkId } from '@oasisdex/web3-context'

export default function OpenPage() {
  const {
    query: { ilk },
  } = useRouter()

  const { web3Context$ } = useAppContext()

  useEffect(() => {
    const subscription = web3Context$.subscribe(async (web3Context) => {
      if (web3Context.status === 'notConnected') {
        web3Context.connect(await getConnector('network', getNetworkId()), 'network')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return <OpenVaultView {...{ ilk: ilk as string }} />
}

OpenPage.layout = AppLayout
