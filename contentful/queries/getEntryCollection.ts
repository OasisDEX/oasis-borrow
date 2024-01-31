import { fetchGraphQL } from 'contentful/api'

function splitArray<T>(arr: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    throw new Error('Chunk size must be greater than zero.')
  }

  const result: T[][] = []

  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize))
  }

  return result
}

export interface LendingPageBannerRawResponse {
  __typename: 'LendingPageBanner'
  title: string
  description: {
    json: string
  }
  cta: {
    label: string
    url: string
  }
}

export interface LendingPageBenefitBoxRawResponse {
  __typename: 'LandingPageBenefitBox'
  title: string
  description: {
    json: string
  }
  icon: {
    url: string
    title: string
  }
}

export interface LendingPageInfoBoxRawResponse {
  __typename: 'LandingPageInfoBox'
  title: string
  description: {
    json: string
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
  __typename: 'LandingPageProductBox'
  title: string
  description: {
    json: string
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
  composition: string
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
  __typename: 'ProductFinder'
  name: string
  token: string
  product: {
    slug: string
    name: string
  }
  initialProtocolCollection: {
    items: {
      slug: string
      name: string
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

export interface EntryRawResponse {
  data: {
    entryCollection: {
      total: string
      items: ({
        sys: {
          id: string
        }
      } & (
        | LendingPageBannerRawResponse
        | LendingPageBenefitBoxRawResponse
        | LendingPageInfoBoxRawResponse
        | LendingPageProductBoxRawResponse
        | ProductFinderRawResponse
      ))[]
    }
  }
}

const entryQuery = async (collectionIds: string[]) => {
  const entry = await fetchGraphQL<EntryRawResponse>(`
    query {
      entryCollection(
        where: {
          sys: { id_in: ${JSON.stringify(collectionIds)} }
        }
        limit: 50
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
  `)

  return entry.data.entryCollection.items
}

export const getEntryCollection = async (collectionIds: string[]) => {
  const splitArrays = splitArray(collectionIds, 40)
  const resp = await Promise.all(splitArrays.map((arr) => entryQuery(arr)))

  return resp.flatMap((item) => item)
}
