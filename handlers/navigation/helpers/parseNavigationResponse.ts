import type { NavigationMenuPanelType } from 'components/navigation/Navigation.types'
import type { ProductHubData } from 'features/productHub/types'
import type { NavigationResponse } from 'handlers/navigation'
import { mapNavigationLinkItem } from 'handlers/navigation/helpers'

interface ParseNavigationResponseParams {
  navigationResponse: NavigationResponse
  productHub: ProductHubData
}

export function parseNavigationResponse({
  navigationResponse,
  productHub,
}: ParseNavigationResponseParams): NavigationMenuPanelType[] {
  return navigationResponse.data.navigation.listOfPanelsCollection.items.map((panel) => ({
    label: panel.label,
    lists: panel.listsOfLinksCollection.items.map((list) => ({
      ...(list.displayTitle && {
        header: list.title,
      }),
      items: mapNavigationLinkItem({ items: list.linksListCollection.items, productHub }),
      ...(list.link && {
        link: list.link,
      }),
    })),
  }))
}
