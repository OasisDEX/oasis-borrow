import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation } from 'components/navigation/Navigation'
import { navigationBreakpoints } from 'components/navigation/Navigation.constants'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import { getNavProductsPanel } from 'features/navigation/panels/getNavProductsPanel'
import { getNavProtocolsPanel } from 'features/navigation/panels/getNavProtocolsPanel'
import { getNavTokensPanel } from 'features/navigation/panels/getNavTokensPanel'
import { getNavUseCasesPanel } from 'features/navigation/panels/getNavUseCasesPanel'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import { useAppConfig } from 'helpers/config'
import { getPortfolioLink } from 'helpers/get-portfolio-link'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function NavigationController() {
  const { t } = useTranslation()
  const {
    productHub,
    config: { navigation },
  } = usePreloadAppDataContext()
  const { isConnected, walletAddress } = useAccount()
  const { connect } = useConnection()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  const { AjnaSafetySwitch } = useAppConfig('features')

  const productHubItems = productHub.table

  const promoCardsData =
    PROMO_CARD_COLLECTIONS_PARSERS[AjnaSafetySwitch ? 'Home' : 'HomeWithAjna'](productHubItems)

  const navProductsPanel = useMemo(
    () => getNavProductsPanel({ t, productHubItems, promoCardsData, isConnected, connect }),
    [t, productHubItems, promoCardsData, isConnected, connect],
  )
  const navProtocolsPanel = useMemo(() => getNavProtocolsPanel({ t, navigation }), [t, navigation])
  const navTokensPanel = useMemo(
    () => getNavTokensPanel({ t, navigation, productHubItems }),
    [t, navigation, productHubItems],
  )
  const navUseCasesPanel = useMemo(() => getNavUseCasesPanel({ t }), [t])

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
        panels={[navProductsPanel, navProtocolsPanel, navTokensPanel, navUseCasesPanel]}
        actions={<NavigationActionsController isConnected={isConnected} />}
      />
      <SwapWidgetShowHide />
    </>
  )
}
