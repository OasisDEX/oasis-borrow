import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import { getAppConfig } from 'helpers/config'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function NavigationController() {
  const { t } = useTranslation()
  const { NewNavigation: isNewNavigationEnabled } = getAppConfig('features')
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  return (
    <>
      <Navigation
        links={[
          {
            label: 'Protocols',
            link: '#',
          },
          {
            label: 'Tokens',
            link: '#',
          },
          {
            label: 'Use Cases',
            link: '#',
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
        {...(isNewNavigationEnabled && {
          panels: [
            {
              label: t('nav.products'),
              lists: [
                {
                  items: [
                    {
                      list: {
                        items: [],
                      },
                      title: t('nav.earn'),
                      description: t('nav.products-earn'),
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: t('nav.multiply'),
                      description: t('nav.products-multiply'),
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: t('nav.borrow'),
                      description: t('nav.products-borrow'),
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: t('nav.swap-and-bridge'),
                      description: t('nav.products-swap-and-bridge'),
                    },
                  ],
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
