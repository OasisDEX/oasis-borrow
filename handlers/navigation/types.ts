import type { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubSupportedNetworks } from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'
import type { FeaturesEnum } from 'types/config'

interface NavigationLink {
  __typename: 'NavigationLink'
  description: string
  featureFlag?: FeaturesEnum
  label: string
  link?: string
  protocol?: {
    name: LendingProtocol
    slug: string
  }
  token?: string
  star: boolean
}

interface NavigationLinkWithNestedLinks extends NavigationLink {
  nestedLinks: {
    title: string
    displayTitle: boolean
    linksListCollection: {
      items: (NavigationLink | FeaturedProduct)[]
    }
    link?: {
      label: string
      url: string
    }
  }
}

export interface FeaturedProduct {
  __typename: 'FeaturedProduct'
  detailedFilters?: {
    id: string
    key: string
    value: string
  }[]
  label?: string
  network: {
    name: string
    slug: ProductHubSupportedNetworks
  }
  primaryToken: string
  secondaryToken: string
  protocol: {
    name: string
    slug: LendingProtocol
  }
  product: {
    name: string
    slug: OmniProductType
  }
}

export type NavigationLinkTypes = NavigationLink | NavigationLinkWithNestedLinks | FeaturedProduct

export interface NavigationResponse {
  data: {
    navigation: {
      listOfPanelsCollection: {
        items: {
          label: string
          listsOfLinksCollection: {
            items: {
              title: string
              displayTitle: boolean
              linksListCollection: {
                items: (NavigationLinkWithNestedLinks | FeaturedProduct)[]
              }
              link?: {
                label: string
                url: string
              }
            }[]
          }
        }[]
      }
    }
  }
}
