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
  // const { connect } = useConnection()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  // const productHubItems = productHub.table

  // const navProductsPanel = useMemo(
  //   () => getNavProductsPanel({ t, productHubItems, isConnected, connect }),
  //   [t, productHubItems, isConnected, connect],
  // )
  // const navProtocolsPanel = useMemo(() => getNavProtocolsPanel({ t, navigation }), [t, navigation])
  // const navTokensPanel = useMemo(
  //   () => getNavTokensPanel({ t, navigation, productHubItems }),
  //   [t, navigation, productHubItems],
  // )
  // const navUseCasesPanel = useMemo(() => getNavUseCasesPanel({ t }), [t])

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
        panels={navigation}
        actions={<NavigationActionsController isConnected={isConnected} />}
      />
      <SwapWidgetShowHide />
    </>
  )
}
