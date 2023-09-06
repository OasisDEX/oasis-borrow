import React, { useEffect, useMemo } from 'react'
import { LiFiWalletManagement, supportedWallets } from '@lifi/wallet-management'
import { LiFiWidget } from '@lifi/widget'
import { useWallets } from '@web3-onboard/react'
import { useMainContext } from 'components/context'
import { swapWidgetConfig } from 'components/swapWidget/swapWidgetConfig'
import { SwapWidgetOnboarding } from 'components/swapWidget/SwapWidgetOnboarding'
import { SwapWidgetSkeleton } from 'components/swapWidget/SwapWidgetSkeleton'
import { useTrackSwapWidgetEvents } from 'helpers/hooks/useTrackSwapWidgetEvents'
import { useObservable } from 'helpers/observableHook'
import { useOnboarding } from 'helpers/useOnboarding'
import { Box } from 'theme-ui'

export function SwapWidget() {
  const { web3ContextConnected$ } = useMainContext()
  const [web3Context] = useObservable(web3ContextConnected$)
  const [isOnboarded] = useOnboarding('SwapWidget')
  const activeOnboardWallets = useWallets()
  const liFiWalletManagement = useMemo(() => new LiFiWalletManagement(), [])

  useTrackSwapWidgetEvents()

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
  }, [activeOnboardWallets, liFiWalletManagement])

  if (!web3Provider) {
    return <SwapWidgetSkeleton />
  }

  return (
    <Box
      sx={{
        height: '100%',
        '& > div': {
          maxHeight: '100%',
          height: '100%',
        },
      }}
    >
      {!isOnboarded ? (
        <SwapWidgetOnboarding />
      ) : (
        <LiFiWidget integrator={swapWidgetConfig.integrator} config={swapWidgetConfig} />
      )}
    </Box>
  )
}
