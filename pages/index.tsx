import { getNetworkId } from '@oasisdex/web3-context';
import { useAppContext } from 'components/AppContextProvider';
import { getConnector } from 'components/connectWallet/ConnectWallet';
import { AppLayout } from 'components/Layouts'
import { LandingView } from 'features/landing/LandingView'
import React, { useEffect } from 'react'

export default function LandingPage() {
  const {  web3Context$ } = useAppContext();

  useEffect(() => {
      const subscription = web3Context$.subscribe(async web3Context => {
          if(web3Context.status === 'notConnected') {
              web3Context.connect(await getConnector('network', getNetworkId()), 'network')
          }
      })
      return () => subscription.unsubscribe()
  }, [])

  return <LandingView />
}

LandingPage.layout = AppLayout
LandingPage.layoutProps = {
  variant: 'landingContainer',
}
LandingPage.theme = 'Landing'
