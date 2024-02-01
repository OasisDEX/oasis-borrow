import { fetchGraphQL } from 'contentful/api'
import { mapBlocksCollection } from 'contentful/mappers/mapBlocksCollection'
import { getEntryCollection } from 'contentful/queries/getEntryCollection'
import type { LandingPageRawResponse } from 'contentful/types'
import type {
  MarketingTemplateHeroProps,
  MarketingTemplatePalette,
  MarketingTemplateProductFinderBlocks,
} from 'features/marketing-layouts/types'

async function extractAndMapLendingPost(fetchResponse: LandingPageRawResponse): Promise<{
  seoTitle: string
  seoDescription: string
  palette: MarketingTemplatePalette
  hero: MarketingTemplateHeroProps
  blocks: MarketingTemplateProductFinderBlocks[]
}> {
  const lendingPost = fetchResponse.data.landingPageCollection.items[0]

  const contentIds = lendingPost.blocksCollection.items.flatMap((blockItem) =>
    blockItem.contentCollection.items.map((contentItem) => contentItem.sys.id),
  )

  const entryCollection = await getEntryCollection(contentIds)

  return {
    seoTitle: lendingPost.seoTitle,
    seoDescription: lendingPost.seoDescription,
    palette: lendingPost.palette,
    hero: {
      protocol: lendingPost.hero.protocolCollection.items.map((item) => item.slug),
      title: lendingPost.hero.title,
      description: lendingPost.hero.description,
      link: lendingPost.hero.link,
      image: lendingPost.hero.image.url,
    },
    blocks: mapBlocksCollection(lendingPost.blocksCollection, entryCollection),
  }
}

export async function getLandingPageBySlug(slug: string) {
  const entry = await fetchGraphQL<LandingPageRawResponse>(
    (preview) => `
    {
      landingPageCollection(
        where: { slug: "${slug}" }
        preview: ${preview}
        limit: 1
      ) {
        items {
          seoTitle
          seoDescription
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
              footer {
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
  )

  return extractAndMapLendingPost(entry)
}
