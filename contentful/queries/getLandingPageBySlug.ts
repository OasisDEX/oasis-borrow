import { fetchGraphQL } from 'contentful/api'
import type { LandingPageRawResponse } from 'contentful/types'

export async function getLandingPageBySlug(slug: string, preview: boolean) {
  return await fetchGraphQL<LandingPageRawResponse>(
    `
      {
        landingPageCollection(
          where: { slug: "${slug}" }
          preview: ${preview}
          limit: 1
        ) {
          items {
            seoTitle
            seoDescription
            seoOgImage {
              url
            }
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
              token
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
    preview,
  )
}
