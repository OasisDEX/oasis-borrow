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
    slug: LendingProtocol
  }
  token?: string
  star: boolean
}

interface NavigationLinkWithNestedLinks extends NavigationLink {
  nestedLinks: {
    title: string
    displayTitle: boolean
    linksListCollection: {
      items: (
        | NavigationLink
        | NavigationFeaturedProduct
        | NavigationTopProducts
        | NavigationTopToken
      )[]
    }
    link?: {
      label: string
      url: string
    }
    tight: boolean
  }
}

export interface NavigationFeaturedProduct {
  __typename: 'FeaturedProduct'
  detailedFilters?: {
    id: string
    key: string
    value: string
  }[]
  label?: string
  network: {
    slug: ProductHubSupportedNetworks
  }
  primaryToken: string
  secondaryToken: string
  protocol: {
    slug: LendingProtocol
  }
  product: {
    slug: OmniProductType
  }
}

export interface NavigationTopProducts {
  __typename: 'NavigationTopProducts'
  product: {
    slug: OmniProductType
  }
}

export interface NavigationTopToken {
  __typename: 'NavigationTopToken'
  token: string
}

export type NavigationLinkTypes =
  | NavigationLink
  | NavigationLinkWithNestedLinks
  | NavigationFeaturedProduct
  | NavigationTopProducts
  | NavigationTopToken

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
                items: (
                  | NavigationLinkWithNestedLinks
                  | NavigationFeaturedProduct
                  | NavigationTopProducts
                  | NavigationTopToken
                )[]
              }
              link?: {
                label: string
                url: string
              }
              tight: boolean
            }[]
          }
        }[]
      }
    }
  }
}
