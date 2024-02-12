import { mapBlocksCollection } from 'contentful/mappers'
import { getLandingPageBySlug, getLandingPageContentByIds } from 'contentful/queries'
import type { MarketingTemplateFreeform } from 'features/marketing-layouts/types'

interface GetMarketingTemplatePagePropsParams {
  slug: string
  preview?: boolean
}

export async function getMarketingTemplatePageProps({
  preview = false,
  slug,
}: GetMarketingTemplatePagePropsParams): Promise<MarketingTemplateFreeform> {
  const {
    data: {
      landingPageCollection: {
        items: [
          {
            hero: {
              protocolCollection: { items: protocols },
              image: { url: image },
              ...hero
            },
            palette,
            seoDescription,
            seoOgImage,
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
    blocksWithoutContent
      .flatMap(({ contentCollection: { items } }) => items)
      .map(({ sys: { id } }) => id),
    preview,
  )

  return {
    blocks: mapBlocksCollection(blocksWithoutContent, blocksWithContent),
    hero: {
      protocol: protocols.map(({ slug: protocolSlug }) => protocolSlug),
      image,
      ...hero,
    },
    seoDescription,
    seoOgImage,
    seoTitle,
    palette,
  }
}
