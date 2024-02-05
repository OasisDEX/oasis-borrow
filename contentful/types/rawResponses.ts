import type { LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'
import {
  MarketingProductBoxComposition,
  MarketingTemplateComparisonTableProps,
  MarketingTemplatePalette,
} from 'features/marketing-layouts/types'
import { LandingPageRawBlocks } from 'contentful/types'
import { ProductHubProductType } from 'features/productHub/types'
import { type Document as ContentfulDocument } from '@contentful/rich-text-types'

export interface LandingPageRawBlocksItems {
  sys: {
    id: string
  }
  title: string
  subtitle: string
  description: {
    json: ContentfulDocument
  }
  contentCollection: {
    total: string
    items: {
      __typename: LandingPageRawBlocks
      sys: {
        id: string
      }
    }[]
  }
}

export interface LandingPageRawResponse {
  data: {
    landingPageCollection: {
      items: {
        seoTitle: string
        seoDescription: string
        hero: {
          protocolCollection: {
            items: {
              name: LendingProtocolLabel
              slug: LendingProtocol
            }[]
          }
          title: string
          token?: string[]
          description: string
          image: {
            filename: string
            url: string
          }
          link: {
            label: string
            url: string
          }
        }
        palette: MarketingTemplatePalette
        blocksCollection: {
          total: number
          items: LandingPageRawBlocksItems[]
        }
      }[]
    }
  }
}

export interface LendingPageBannerRawResponse {
  __typename: LandingPageRawBlocks.BANNER
  title: string
  description?: {
    json: ContentfulDocument
  }
  cta: {
    label: string
    url: string
  }
}

export interface LendingPageComparisonTableRawResponse {
  __typename: LandingPageRawBlocks.COMPARISON_TABLE
  table: MarketingTemplateComparisonTableProps
}

export interface LendingPageBenefitBoxRawResponse {
  __typename: LandingPageRawBlocks.BENEFIT_BOX
  title: string
  description: {
    json: ContentfulDocument
  }
  icon: {
    url: string
    title: string
  }
}

export interface LendingPageInfoBoxRawResponse {
  __typename: LandingPageRawBlocks.INFO_BOX
  title: string
  description: {
    json: ContentfulDocument
  }
  image: {
    title: string
    url: string
  }
  link: {
    label: string
    url: string
  }
  tokens: string[]
}

export interface LendingPageProductBoxRawResponse {
  __typename: LandingPageRawBlocks.PRODUCT_BOX
  title: string
  description: {
    json: ContentfulDocument
  }
  type: string
  image: {
    title: string
    url: string
  }
  link: {
    label: string
    url: string
  }
  composition: MarketingProductBoxComposition
  actionsListCollection: {
    items: {
      label: string
      description: string
      icon: {
        url: string
        title: string
      }
    }[]
  }
}

export interface ProductFinderRawResponse {
  __typename: LandingPageRawBlocks.PRODUCT_FINDER
  name: string
  token: string
  product: {
    slug: ProductHubProductType
    name: string
  }
  initialProtocolCollection: {
    items: {
      slug: LendingProtocol
      name: LendingProtocolLabel
    }[]
  }
  initialNetworkCollection: {
    items: {
      slug: string
      name: string
    }[]
  }
  promoCardsCollection: {
    items: {
      name: string
      network: { name: string; slug: string }
      primaryToken: string
      secondaryToken: string
      protocol: {
        name: string
        slug: string
      }
      product: {
        name: string
        slug: string
      }
    }[]
  }
}

export type EntryCollectionRawItemResponse = {
  sys: {
    id: string
  }
} & (
  | LendingPageBannerRawResponse
  | LendingPageBenefitBoxRawResponse
  | LendingPageInfoBoxRawResponse
  | LendingPageProductBoxRawResponse
  | ProductFinderRawResponse
)

export interface EntryRawResponse {
  data: {
    entryCollection: {
      total: string
      items: EntryCollectionRawItemResponse[]
    }
  }
}
