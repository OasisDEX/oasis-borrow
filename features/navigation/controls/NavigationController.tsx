import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
} from 'features/swapWidget/SwapWidgetChange'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { uiChanges } from 'helpers/uiChanges'
import { useAccount } from 'helpers/useAccount'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

export default function NavigationController() {
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  return (
    <>
      <Navigation
        links={[
          {
            label: 'Borrow',
            link: INTERNAL_LINKS.borrow,
          },
          {
            label: 'Multiply',
            link: INTERNAL_LINKS.multiply,
          },
          {
            label: 'Earn',
            link: INTERNAL_LINKS.earn,
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
