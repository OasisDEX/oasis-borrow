import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation } from 'components/navigation/Navigation'
import { navigationBreakpoints } from 'components/navigation/Navigation.constants'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import { getPortfolioLink } from 'helpers/get-portfolio-link'
import { useAccount } from 'helpers/useAccount'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function NavigationController() {
  const { navigation } = usePreloadAppDataContext()
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  // TODO figure out why unpublish of Use Cases in contentful causes error
  const resolvedNavigation = navigation.filter((item) => item.label !== 'Use Cases')

  return (
    <>
      <Navigation
        links={[
          ...(isConnected && !isViewBelowXl
            ? [
                {
                  label: <MyPositionsLink />,
                  link: getPortfolioLink(walletAddress),
                },
              ]
            : []),
        ]}
        panels={resolvedNavigation}
        actions={<NavigationActionsController isConnected={isConnected} />}
      />
      <SwapWidgetShowHide />
    </>
  )
}
