import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { MyPositionsOrb } from 'components/navigation/content/MyPositionsOrb'
import { NotificationsOrb } from 'components/navigation/content/NotificationsOrb'
import { SwapWidgetOrb } from 'components/navigation/content/SwapWidgetOrb'
import { WalletOrb } from 'components/navigation/content/WalletOrb'
import { WalletPanelMobile } from 'components/navigation/content/WalletPanelMobile'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { NavigationNetworkSwitcherOrb } from 'components/navigation/NavigationNetworkSwitcher'
import { ConnectButton } from 'features/web3OnBoard'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function AjnaNavigationController() {
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3]})`)
  const isViewBelowL = useMediaQuery(`(max-width: ${navigationBreakpoints[2]})`)
  const isViewBelowM = useMediaQuery(`(max-width: ${navigationBreakpoints[1]})`)

  const useNetworkSwitcher = useFeatureToggle('UseNetworkSwitcher')
  const swapWidgetFeatureToggle = useFeatureToggle('SwapWidget')

  return (
    <Navigation
      pill={{ label: 'Ajna', color: ['#f154db', '#974eea'] }}
      links={[
        {
          label: 'Borrow',
          link: INTERNAL_LINKS.ajnaBorrow,
        },
        {
          label: 'Multiply',
          link: INTERNAL_LINKS.ajnaMultiply,
        },
        {
          label: 'Earn',
          link: INTERNAL_LINKS.ajnaEarn,
        },
        ...(isConnected && !isViewBelowXl
          ? [
              {
                label: <MyPositionsLink />,
                link: `/owner/${walletAddress}`,
              },
            ]
          : []),
      ]}
      actions={
        isConnected ? (
          <>
            {isViewBelowXl && <MyPositionsOrb />}
            {swapWidgetFeatureToggle && <SwapWidgetOrb />}
            <NotificationsOrb />
            {useNetworkSwitcher && <NavigationNetworkSwitcherOrb />}
            {isViewBelowM ? <WalletPanelMobile /> : <WalletOrb />}
          </>
        ) : (
          <>
            {useNetworkSwitcher && <NavigationNetworkSwitcherOrb />}
            {!isViewBelowL && <ConnectButton />}
          </>
        )
      }
    />
  )
}
