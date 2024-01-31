import { fetchGraphQL } from 'contentful/api'
import { mapContentCollection } from 'contentful/mappers/mapContentCollection'
import { getEntryCollection } from 'contentful/queries/getEntryCollection'
import type {
  MarketingTemplateHeroProps,
  MarketingTemplatePalette,
  MarketingTemplateProductFinderBlocks,
} from 'features/marketing-layouts/types'
import type { LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'

interface LandingPageRawResponse {
  data: {
    landingPageCollection: {
      items: {
        hero: {
          protocolCollection: {
            items: {
              name: LendingProtocolLabel
              slug: LendingProtocol
            }[]
          }
          title: string
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
          total: string
          items: {
            sys: {
              id: string
            }
            title: string
            subtitle: string
            description: {
              json: string
            }
            contentCollection: {
              total: string
              items: {
                __typename: string
                sys: {
                  id: string
                }
              }[]
            }
          }[]
        }
      }[]
    }
  }
}

async function extractAndMapLendingPost(fetchResponse: LandingPageRawResponse): Promise<{
  palette: MarketingTemplatePalette
  hero: MarketingTemplateHeroProps
  blocks: MarketingTemplateProductFinderBlocks
}> {
  const lendingPost = fetchResponse.data.landingPageCollection.items[0]

  const contentIds = lendingPost.blocksCollection.items.flatMap((blockItem) =>
    blockItem.contentCollection.items.map((contentItem) => contentItem.sys.id),
  )

  const entryCollection = await getEntryCollection(contentIds)

  const blocksCollection = lendingPost.blocksCollection.items.map((blockItem) => ({
    ...blockItem,
    type: blockItem.contentCollection.items[0].__typename,
    collection: blockItem.contentCollection.items.map((contentItem) =>
      entryCollection.find((item) => item.sys.id === contentItem.sys.id),
    ),
  }))

  const mappedBlocksCollection = mapContentCollection(blocksCollection)

  return {
    palette: lendingPost.palette,
    hero: {
      protocol: lendingPost.hero.protocolCollection.items.map((item) => item.slug),
      title: lendingPost.hero.title,
      description: lendingPost.hero.description,
      link: lendingPost.hero.link,
      image: lendingPost.hero.image.url,
    },
    blocks: mappedBlocksCollection,
  }
}

export async function getLandingPageBySlug(slug: string | undefined) {
  const entry = await fetchGraphQL<LandingPageRawResponse>(
    `query {
            landingPageCollection(where: { slug: "${slug}" }, preview: true, limit: 1) {
              items {
                title
                slug
                hero {
                  title
                  description
                  protocolCollection {
                    items {
                      name
                      slug
                    }
                  }
                  link {
                    label
                    url
                  }
                  image {
                    title
                    url
                  }
                }
                palette {
                  foreground
                  background
                }
                blocksCollection {
                  total
                  items {
                    title
                    subtitle
                    description {
                      json
                    }
                    sys {
                      id
                    }
                    contentCollection {
                      total
                      items {
                        __typename
                        ... on Entry {
                          sys {
                            id
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
            `,
    true,
  )
  return extractAndMapLendingPost(entry)
}
