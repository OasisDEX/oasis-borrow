import { LiFiWalletManagement, supportedWallets } from '@lifi/wallet-management'
import { LiFiWidget } from '@lifi/widget'
import { useWallets } from '@web3-onboard/react'
import { useAppContext } from 'components/AppContextProvider'
import { Skeleton } from 'components/Skeleton'
import { useObservable } from 'helpers/observableHook'
import { useOnboarding } from 'helpers/useOnboarding'
import React, { useEffect } from 'react'
import { Box } from 'theme-ui'

import { swapWidgetConfig } from './swapWidgetConfig'
import { SwapWidgetOnboarding } from './SwapWidgetOnboarding'

const liFiWalletManagement = new LiFiWalletManagement()

export function SwapWidget() {
  const { web3ContextConnected$ } = useAppContext()
  const [web3Context] = useObservable(web3ContextConnected$)
  const [isOnboarded] = useOnboarding('Exchange')
  const activeOnboardWallets = useWallets()

  const web3Provider =
    web3Context?.status !== 'connectedReadonly' ? web3Context?.web3.currentProvider : null

  useEffect(() => {
    async function autoConnectLiFi() {
      const activeWallets = supportedWallets.filter((wallet) =>
        activeOnboardWallets.some((activeWallet) => activeWallet.label === wallet.name),
      )
      if (!activeWallets.length) {
        return
      }
      await liFiWalletManagement.connect(activeWallets[0])
    }
    void autoConnectLiFi()
  }, [activeOnboardWallets])

  if (!web3Provider) {
    return (
      <Box sx={{ minWidth: '390px' }}>
        <Skeleton />
      </Box>
    )
  }

  return (
    <Box>
      {!isOnboarded ? (
        <SwapWidgetOnboarding />
      ) : (
        <LiFiWidget integrator="Your dApp/company name" config={swapWidgetConfig} />
      )}
    </Box>
  )
}
