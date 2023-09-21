import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
} from 'features/swapWidget/SwapWidgetChange'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { getAppConfig } from 'helpers/config'
import { uiChanges } from 'helpers/uiChanges'
import { useAccount } from 'helpers/useAccount'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function NavigationController() {
  const { NewNavigation: isNewNavigationEnabled } = getAppConfig('features')
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
        {...(isNewNavigationEnabled && {
          panels: [
            {
              description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a nisl congue, pretium metus eu, porttitor lacus. Donec convallis rhoncus ultrices.',
              label: 'Label',
              learn: {
                label: 'Learn label',
                link: '#learn',
              },
              link: '#link',
              links: [
                {
                  icon: '',
                  title: 'title',
                  link: '#link',
                  footnote: <>footnote</>,
                },
                {
                  icon: '',
                  title: 'title',
                  link: '#link',
                  footnote: <>footnote</>,
                },
              ],
              otherAssets: [
                {
                  token: 'ETH',
                  link: '#token',
                },
              ],
            },
          ],
        })}
        actions={<NavigationActionsController isConnected={isConnected} />}
      />
      <SwapWidgetShowHide />
    </>
  )
}
