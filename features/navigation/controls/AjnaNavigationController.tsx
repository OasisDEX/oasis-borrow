import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation } from 'components/navigation/Navigation'
import { navigationBreakpoints } from 'components/navigation/Navigation.constants'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import type { SwapWidgetChangeAction } from 'features/swapWidget/SwapWidgetChange'
import { SWAP_WIDGET_CHANGE_SUBJECT } from 'features/swapWidget/SwapWidgetChange'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { uiChanges } from 'helpers/uiChanges'
import { useAccount } from 'helpers/useAccount'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function AjnaNavigationController() {
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  return (
    <>
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
                  label: 'Swap',
                  onClick: () => {
                    uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
                      type: 'open',
                    })
                  },
                },

                {
                  label: <MyPositionsLink />,
                  link: `/owner/${walletAddress}`,
                },
              ]
            : []),
        ]}
        actions={<NavigationActionsController isConnected={isConnected} />}
      />
      <SwapWidgetShowHide />
    </>
  )
}
