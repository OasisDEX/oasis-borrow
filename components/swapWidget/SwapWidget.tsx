import { LiFiWalletManagement, supportedWallets } from '@lifi/wallet-management'
import { LiFiWidget } from '@lifi/widget'
import { useWallets } from '@web3-onboard/react'
import { NetworkIds } from 'blockchain/networks'
import {
  arbitrumMainnetRpc,
  baseMainnetRpc,
  mainnetRpc,
  optimismMainnetRpc,
} from 'config/rpcConfig'
import type { SwapWidgetState } from 'features/swapWidget/SwapWidgetChange'
import { SWAP_WIDGET_CHANGE_SUBJECT } from 'features/swapWidget/SwapWidgetChange'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { useTrackSwapWidgetEvents } from 'helpers/hooks'
import { useObservable } from 'helpers/observableHook'
import { uiChanges } from 'helpers/uiChanges'
import { useOnboarding } from 'helpers/useOnboarding'
import React, { useEffect, useMemo } from 'react'
import { Box } from 'theme-ui'

import { swapWidgetConfig } from './swapWidgetConfig'
import { SwapWidgetOnboarding } from './SwapWidgetOnboarding'
import { SwapWidgetSkeleton } from './SwapWidgetSkeleton'

export function SwapWidget() {
  const { signer } = useWalletManagement()
  const [isOnboarded] = useOnboarding('SwapWidget')
  const activeOnboardWallets = useWallets()
  const liFiWalletManagement = useMemo(() => new LiFiWalletManagement(), [])
  useTrackSwapWidgetEvents()

  const [swapWidgetChange] = useObservable(
    uiChanges.subscribe<SwapWidgetState>(SWAP_WIDGET_CHANGE_SUBJECT),
  )

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

  if (!signer) {
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
        <LiFiWidget
          integrator={swapWidgetConfig.integrator}
          config={{
            ...swapWidgetConfig,
            subvariantOptions: swapWidgetChange?.variant,
            sdkConfig: {
              rpcs: {
                [NetworkIds.MAINNET]: [mainnetRpc],
                [NetworkIds.BASEMAINNET]: [baseMainnetRpc],
                [NetworkIds.ARBITRUMMAINNET]: [arbitrumMainnetRpc],
                [NetworkIds.OPTIMISMMAINNET]: [optimismMainnetRpc],
              },
            },
          }}
        />
      )}
    </Box>
  )
}
