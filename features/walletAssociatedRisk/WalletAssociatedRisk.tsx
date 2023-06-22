import { useAppContext } from 'components/AppContextProvider'
import { useWalletManagement } from 'features/web3OnBoard'
import { useObservable } from 'helpers/observableHook'
import getConfig from 'next/config'
import React, { ReactNode, useEffect } from 'react'

interface WithWalletAssociatedRiskProps {
  children: ReactNode
}

export function WithWalletAssociatedRisk({ children }: WithWalletAssociatedRiskProps) {
  const { walletAssociatedRisk$ } = useAppContext()
  const [walletAssociatedRisk] = useObservable(walletAssociatedRisk$)
  const shouldUseTrm = getConfig()?.publicRuntimeConfig?.useTrmApi
  const { disconnect } = useWalletManagement()

  useEffect(() => {
    if (walletAssociatedRisk?.isRisky && shouldUseTrm) {
      alert(
        'Your wallet has been flagged by our automated risk tools, and as such your access to oasis.app restricted. If you believe this to be incorrect, please reach out to support@oasis.app',
      )
      void disconnect()
    }
  }, [walletAssociatedRisk, disconnect, shouldUseTrm])

  return <>{children}</>
}
