import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import { getNavProductsPanel } from 'features/navigation/getNavProductsPanel'
import { getNavProtocolsPanel } from 'features/navigation/getNavProtocolsPanel'
import { getNavTokensPanel } from 'features/navigation/getNavTokensPanel'
import { getNavUseCasesPanel } from 'features/navigation/getNavUseCasesPanel'
import {
  type SwapWidgetChangeAction,
  SWAP_WIDGET_CHANGE_SUBJECT,
} from 'features/swapWidget/SwapWidgetChange'
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
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  const { AjnaSafetySwitch } = useAppConfig('features')

  const resolvedData = AjnaSafetySwitch
    ? productHub.table.filter((item) => item.protocol !== 'ajna')
    : productHub.table

  const promoCardsData = PROMO_CARD_COLLECTIONS_PARSERS['HomeWithAjna'](resolvedData)

  const navProductsPanel = useMemo(
    () => getNavProductsPanel({ t, productHubItems: resolvedData, promoCardsData }),
    [t, resolvedData, promoCardsData],
  )
  const navProtocolsPanel = useMemo(() => getNavProtocolsPanel({ t, navigation }), [t, navigation])
  const navTokensPanel = useMemo(
    () => getNavTokensPanel({ t, navigation, productHubItems: resolvedData }),
    [t, navigation, resolvedData],
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
