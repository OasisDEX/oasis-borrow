import { fetchContentfulGraphQL } from 'contentful/api'
import { landingPageContentsChunkSize } from 'contentful/constants'
import type { EntryRawResponse } from 'contentful/types'
import { splitArrayToSameSizeChunks } from 'helpers/splitArrayToSameSizeChunks'

export const getLandingPageContentByIds = async (collectionIds: string[], preview: boolean) => {
  return (
    await Promise.all(
      splitArrayToSameSizeChunks(collectionIds, landingPageContentsChunkSize).map(
        (collectionIdsChunk) =>
          fetchContentfulGraphQL<EntryRawResponse>(
            `
            {
              entryCollection(
                where: {
                  sys: { id_in: ${JSON.stringify(collectionIdsChunk)} }
                }
                preview: ${preview}
                limit: ${landingPageContentsChunkSize}
              ) {
                total
                items {
                __typename
                  sys {
                    id
                  }
                  ... on LandingPageBanner {
                    title
                    description {
                      json
                    }
                    cta {
                      label
                      url
                    }
                  }
                  ... on ComparisonTable {
                    table
                    highlightedColumn
                  }
                  ... on LandingPageBenefitBox {
                    title
                    description {
                      json
                    }
                    icon {
                      url
                      title
                      width
                      height
                      description
                    }
                  }
                  ... on LandingPageInfoBox {
                    title
                    description {
                      json
                    }
                    image {
                      url
                      title
                    }
                    link {
                      url
                      label
                    }
                    tokens
                  }
                  ... on LandingPageProductBox {
                    title
                    description {
                      json
                    }
                    type
                    image {
                      url
                      title
                    }
                    contentImage {
                      url
                      title
                    }
                    link {
                      url
                      label
                    }
                    composition
                    actionsListCollection {
                      items {
                        label
                        description
                        icon {
                          url
                          title
                        }
                      }
                    }
                  }
                  ... on ProductFinder {
                    name
                    collateralToken
                    debtToken
                    depositToken
                    product {
                      slug
                      name
                    }
                    initialProtocolCollection {
                      items {
                        name
                        slug
                      }
                    }
                    initialNetworkCollection {
                      items {
                        name
                        slug
                      }
                    }
                    databaseQuery
                    promoCardsCollection {
                      items {
                        name
                        network {
                          name
                          slug
                        }
                        primaryToken
                        secondaryToken
                        protocol {
                          name
                          slug
                        }
                        product {
                          name
                          slug
                        }
                        label
                        detailedFilters
                      }
                    }
                  }
                }
              }
            }
          `,
            preview,
          ),
      ),
    )
  ).reduce<EntryRawResponse>(
    (total, current, i) => ({
      ...(i === 0
        ? current
        : {
            ...total,
            data: {
              entryCollection: {
                total: total.data.entryCollection.total + current.data.entryCollection.total,
                items: [...total.data.entryCollection.items, ...current.data.entryCollection.items],
              },
            },
          }),
    }),
    {} as EntryRawResponse,
  )
}
