import getConfig from 'next/config'
import React, { ReactNode, useEffect } from 'react'

import { useAppContext } from '../../components/AppContextProvider'
import { disconnect } from '../../components/connectWallet/ConnectWallet'
import { useObservable } from '../../helpers/observableHook'

interface WithWalletAssociatedRiskProps {
  children: ReactNode
}

export function WithWalletAssociatedRisk({ children }: WithWalletAssociatedRiskProps) {
  const { walletAssociatedRisk$, web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const [walletAssociatedRisk] = useObservable(walletAssociatedRisk$)
  const shouldUseTrm = getConfig()?.publicRuntimeConfig?.useTrmApi

  useEffect(() => {
    if (walletAssociatedRisk?.error && shouldUseTrm) {
      alert('We are temporarily unable to verify your address. Please try again in a moment.')
      disconnect(web3Context)
    }

    if (walletAssociatedRisk?.isRisky && shouldUseTrm) {
      alert('Your wallet address is associated with risk. You have been disconnected.')
      disconnect(web3Context)
    }
  }, [walletAssociatedRisk, web3Context])

  return <>{children}</>
}
