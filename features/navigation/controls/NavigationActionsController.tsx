import { MyPositionsOrb } from 'components/navigation/content/MyPositionsOrb'
import { WalletOrb } from 'components/navigation/content/WalletOrb'
import { WalletPanelMobile } from 'components/navigation/content/WalletPanelMobile'
import { navigationBreakpoints } from 'components/navigation/Navigation.constants'
import { NavigationNetworkSwitcherOrb } from 'components/navigation/NavigationNetworkSwitcher'
import { NavigationRays } from 'components/navigation/NavigationRays'
import type { useUserRays } from 'features/rays/hooks/useUserRays'
import { ConnectButton } from 'features/web3OnBoard/connect-button'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

interface NavigationActionsControllerProps {
  isConnected: boolean
  userRaysData?: ReturnType<typeof useUserRays>['userRaysData']
}

export function NavigationActionsController({
  isConnected,
  userRaysData,
}: NavigationActionsControllerProps) {
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)
  const isViewBelowL = useMediaQuery(`(max-width: ${navigationBreakpoints[2] - 1}px)`)
  const isViewBelowM = useMediaQuery(`(max-width: ${navigationBreakpoints[1] - 1}px)`)

  return (
    <>
      {isConnected ? (
        <>
          {isViewBelowXl && <NavigationRays userRaysData={userRaysData} />}
          {isViewBelowXl && <MyPositionsOrb />}
          {!isViewBelowXl && <NavigationRays userRaysData={userRaysData} />}
          <NavigationNetworkSwitcherOrb />
          {isViewBelowM ? <WalletPanelMobile /> : <WalletOrb />}
        </>
      ) : (
        <>
          <NavigationRays userRaysData={userRaysData} />
          <NavigationNetworkSwitcherOrb />
          {!isViewBelowL && <ConnectButton />}
        </>
      )}
    </>
  )
}
