import { fetchGraphQL } from 'contentful/api'
import { entryCollectionRequestChunkSize } from 'contentful/consts'
import type { EntryRawResponse } from 'contentful/types'
import { splitArrayToSameSizeChunks } from 'helpers/splitArrayToSameSizeChunks'

const entryQuery = async (collectionIds: string[]) => {
  const entry = await fetchGraphQL<EntryRawResponse>(
    `
    query {
      entryCollection(
        where: {
          sys: { id_in: ${JSON.stringify(collectionIds)} }
        }
        limit: ${entryCollectionRequestChunkSize}
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
            token
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
              }
            }
          }
        }
      }
    }
  `,
  )

  return entry.data.entryCollection.items
}

export const getEntryCollection = async (collectionIds: string[]) => {
  const splitArrays = splitArrayToSameSizeChunks(collectionIds, entryCollectionRequestChunkSize)
  const resp = await Promise.all(splitArrays.map((arr) => entryQuery(arr)))

  return resp.flatMap((item) => item)
}
