import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAccount } from 'helpers/useAccount'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function NavigationController() {
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3]})`)

  return (
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
        {
          label: 'Discover',
          link: INTERNAL_LINKS.discover,
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
