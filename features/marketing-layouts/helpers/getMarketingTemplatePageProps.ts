import { mapBlocksCollection } from 'contentful/mappers'
import { getLandingPageBySlug, getLandingPageContentByIds } from 'contentful/queries'

interface GetMarketingTemplatePagePropsParams {
  slug: string
  preview?: boolean
}

export async function getMarketingTemplatePageProps({
  preview = false,
  slug,
}: GetMarketingTemplatePagePropsParams) {
  const {
    data: {
      landingPageCollection: {
        items: [
          {
            hero: {
              protocolCollection: { items: protocols },
              ...hero
            },
            palette,
            seoDescription,
            seoTitle,
            blocksCollection: { items: blocksWithoutContent },
          },
        ],
      },
    },
  } = await getLandingPageBySlug(slug, preview)
  const {
    data: {
      entryCollection: { items: blocksWithContent },
    },
  } = await getLandingPageContentByIds(
    blocksWithoutContent.map(({ sys: { id } }) => id),
    preview,
  )

  return {
    blocks: mapBlocksCollection(blocksWithoutContent, blocksWithContent),
    hero: {
      protocol: protocols.map(({ slug: protocolSlug }) => protocolSlug),
      ...hero,
    },
    seoDescription,
    seoTitle,
    palette,
  }
}
