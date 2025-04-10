import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation } from 'components/navigation/Navigation'
import { navigationBreakpoints } from 'components/navigation/Navigation.constants'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { WithArrow } from 'components/WithArrow'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import type { useUserRays } from 'features/rays/hooks/useUserRays'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { getPortfolioLink } from 'helpers/get-portfolio-link'
import { useAccount } from 'helpers/useAccount'
import Link from 'next/link'
import React from 'react'
import { Box, Button, Card, Text } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

import { LazyBannerNavBackground } from './LazyBannerNavBackground'

export function NavigationController({
  userRaysData,
}: {
  userRaysData?: ReturnType<typeof useUserRays>['userRaysData']
}) {
  const { navigation } = usePreloadAppDataContext()
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  // TODO figure out why unpublish of Use Cases in contentful causes error
  const resolvedNavigation = navigation
    .filter((item) => item.label !== 'Use Cases')
    .map((item) => {
      if (item.label === 'Protocols') {
        return {
          ...item,
          alwaysVisibleNode: (
            <Card
              sx={{
                background:
                  'linear-gradient(90deg, rgba(255, 73, 164, 0.15) 0%, rgba(176, 73, 255, 0.15) 93%)',
                border: 'unset',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
                <LazyBannerNavBackground />
              </Box>
              <Text as="p" variant="paragraph4" sx={{ maxWidth: '229px', marginBottom: 3 }}>
                The Lazy Summer Protocol is now live! Get effortless access to Defi's highest
                quality yields
              </Text>
              <Link href={EXTERNAL_LINKS.LAZY_SUMMER} target="_blank">
                <Button
                  variant="secondary"
                  sx={{
                    background: 'linear-gradient(90deg, #FF49A4 0%, #B049FF 93%)',
                  }}
                >
                  <WithArrow variant="paragraph3" sx={{ color: 'white' }}>
                    Try it now
                  </WithArrow>
                </Button>
              </Link>
            </Card>
          ),
        }
      }
      return item
    })

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
        actions={
          <NavigationActionsController isConnected={isConnected} userRaysData={userRaysData} />
        }
      />
      <SwapWidgetShowHide />
    </>
  )
}
