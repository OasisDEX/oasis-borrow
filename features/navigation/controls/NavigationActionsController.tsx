import { MyPositionsOrb } from 'components/navigation/content/MyPositionsOrb'
import { NotificationsOrb } from 'components/navigation/content/NotificationsOrb'
import { SwapWidgetOrb } from 'components/navigation/content/SwapWidgetOrb'
import { WalletOrb } from 'components/navigation/content/WalletOrb'
import { WalletPanelMobile } from 'components/navigation/content/WalletPanelMobile'
import { navigationBreakpoints } from 'components/navigation/Navigation'
import { NavigationNetworkSwitcherOrb } from 'components/navigation/NavigationNetworkSwitcher'
import { ConnectButton } from 'features/web3OnBoard'
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
          {isViewBelowXl && <SwapWidgetOrb />}
          {isViewBelowXl && <MyPositionsOrb />}
          <NotificationsOrb />
          {<NavigationNetworkSwitcherOrb />}
          {isViewBelowM ? <WalletPanelMobile /> : <WalletOrb />}
        </>
      ) : (
        <>
          {<NavigationNetworkSwitcherOrb />}
          {!isViewBelowL && <ConnectButton />}
        </>
      )}
    </>
  )
}
