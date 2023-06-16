import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAccount } from 'helpers/useAccount'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function AjnaNavigationController() {
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3]})`)

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
      actions={<NavigationActionsController isConnected={isConnected} />}
    />
  )
}
