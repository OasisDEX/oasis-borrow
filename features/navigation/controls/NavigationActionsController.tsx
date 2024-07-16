import { MyPositionsOrb } from 'components/navigation/content/MyPositionsOrb'
import { WalletOrb } from 'components/navigation/content/WalletOrb'
import { WalletPanelMobile } from 'components/navigation/content/WalletPanelMobile'
import { navigationBreakpoints } from 'components/navigation/Navigation.constants'
import { NavigationNetworkSwitcherOrb } from 'components/navigation/NavigationNetworkSwitcher'
import { NavigationRays } from 'components/navigation/NavigationRays'
import { ConnectButton } from 'features/web3OnBoard/connect-button'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

interface NavigationActionsControllerProps {
  isConnected: boolean
}

export function NavigationActionsController({ isConnected }: NavigationActionsControllerProps) {
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)
  const isViewBelowL = useMediaQuery(`(max-width: ${navigationBreakpoints[2] - 1}px)`)
  const isViewBelowM = useMediaQuery(`(max-width: ${navigationBreakpoints[1] - 1}px)`)

  return (
    <>
      {isConnected ? (
        <>
          {isViewBelowXl && <NavigationRays />}
          {isViewBelowXl && <MyPositionsOrb />}
          {!isViewBelowXl && <NavigationRays />}
          <NavigationNetworkSwitcherOrb />
          {isViewBelowM ? <WalletPanelMobile /> : <WalletOrb />}
        </>
      ) : (
        <>
          <NavigationRays />
          <NavigationNetworkSwitcherOrb />
          {!isViewBelowL && <ConnectButton />}
        </>
      )}
    </>
  )
}
