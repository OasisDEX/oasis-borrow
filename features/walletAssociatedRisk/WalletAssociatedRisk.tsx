import { useAppContext } from 'components/AppContextProvider'
import { disconnect } from 'components/connectWallet'
import { useObservable } from 'helpers/observableHook'
import getConfig from 'next/config'
import React, { ReactNode, useEffect } from 'react'

interface WithWalletAssociatedRiskProps {
  children: ReactNode
}

export function WithWalletAssociatedRisk({ children }: WithWalletAssociatedRiskProps) {
  const { walletAssociatedRisk$, web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const [walletAssociatedRisk] = useObservable(walletAssociatedRisk$)
  const shouldUseTrm = getConfig()?.publicRuntimeConfig?.useTrmApi

  useEffect(() => {
    if (walletAssociatedRisk?.isRisky && shouldUseTrm) {
      alert(
        'Your wallet has been flagged by our automated risk tools, and as such your access to oasis.app restricted. If you believe this to be incorrect, please reach out to support@oasis.app',
      )
      disconnect(web3Context)
    }
  }, [walletAssociatedRisk, web3Context])

  return <>{children}</>
}
