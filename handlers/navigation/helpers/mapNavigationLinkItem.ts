import type { NavigationMenuPanelListItem } from 'components/navigation/Navigation.types'
import { OmniProductType } from 'features/omni-kit/types'
import { filterFeaturedProducts } from 'features/productHub/helpers'
import type { ProductHubData } from 'features/productHub/types'
import type { NavigationLinkTypes } from 'handlers/navigation'
import {
  mapFeaturedEarnProduct,
  mapFeaturedMultiplyProduct,
  mapFeaturedProductToFilterCriteria,
} from 'handlers/navigation/helpers'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'

interface PapNavigationLinkItemParams {
  items: NavigationLinkTypes[]
  productHub: ProductHubData
}

export function mapNavigationLinkItem({
  items,
  productHub,
}: PapNavigationLinkItemParams): NavigationMenuPanelListItem[] {
  return items.flatMap((item) => {
    switch (item.__typename) {
      case 'NavigationLink': {
        const { description, featureFlag, label, link, protocol, star, token } = item

        return {
          title: label,
          description,
          promoted: star,
          ...(protocol && {
            hoverColor: lendingProtocolsByName[protocol.slug].gradient,
            icon: {
              image: lendingProtocolsByName[protocol.slug].icon,
              position: 'title',
            },
          }),
          ...(token && {
            icon: {
              tokens: [token],
              position: 'title',
            },
          }),
          ...(link && { url: link }),
          ...(featureFlag && { featureFlag }),
          ...('nestedLinks' in item &&
            item.nestedLinks && {
              list: {
                ...(item.nestedLinks.displayTitle && {
                  header: item.nestedLinks.title,
                }),
                items: mapNavigationLinkItem({
                  items: item.nestedLinks.linksListCollection.items,
                  productHub,
                }),
                ...(item.nestedLinks.link && {
                  link: item.nestedLinks.link,
                }),
              },
            }),
        }
      }
      case 'FeaturedProduct': {
        const filteredProducts = filterFeaturedProducts({
          filters: { products: [mapFeaturedProductToFilterCriteria(item)] },
          rows: productHub.table,
        })

        switch (item.product.slug) {
          case OmniProductType.Multiply: {
            return mapFeaturedMultiplyProduct(filteredProducts)
          }
          case OmniProductType.Earn: {
            return mapFeaturedEarnProduct(filteredProducts)
          }
        }

        return [] as NavigationMenuPanelListItem[]
      }
    }
  })
}
