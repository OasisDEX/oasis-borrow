import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import { getAppConfig } from 'helpers/config'
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
          ...(isConnected && !isViewBelowXl
            ? [
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
              description: 'Lorem ipsum',
              label: 'Label',
              learn: {
                label: 'Learn label',
                link: '#learn',
              },
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
            {
              description: 'Lorem ipsum',
              label: 'Label 2',
              learn: {
                label: 'Learn label',
                link: '#learn',
              },
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
