import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import { getNavProductsPanel } from 'features/navigation/panels/getNavProductsPanel'
import { getNavProtocolsPanel } from 'features/navigation/panels/getNavProtocolsPanel'
import { getNavTokensPanel } from 'features/navigation/panels/getNavTokensPanel'
import { getNavUseCasesPanel } from 'features/navigation/panels/getNavUseCasesPanel'
import {
  type SwapWidgetChangeAction,
  SWAP_WIDGET_CHANGE_SUBJECT,
} from 'features/swapWidget/SwapWidgetChange'
import { useConnection } from 'features/web3OnBoard'
import { PROMO_CARD_COLLECTIONS_PARSERS } from 'handlers/product-hub/promo-cards'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { uiChanges } from 'helpers/uiChanges'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function NavigationController() {
  const { t } = useTranslation()
  const { NewNavigation: isNewNavigationEnabled } = useAppConfig('features')
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
          ...(!isNewNavigationEnabled
            ? [
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
              ]
            : []),
          ...(!isNewNavigationEnabled && isConnected && !isViewBelowXl
            ? [
                {
                  label: 'Swap',
                  onClick: () => {
                    uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
                      type: 'open',
                    })
                  },
                },
              ]
            : []),
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
          panels: [navProductsPanel, navProtocolsPanel, navTokensPanel, navUseCasesPanel],
        })}
        actions={<NavigationActionsController isConnected={isConnected} />}
      />
      <SwapWidgetShowHide />
    </>
  )
}
