import type { LandingPageBanner } from 'contentful/types'
import type { MarketingTemplateBannerBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingPageBannerBlock = (
  blockItem: LandingPageBanner,
): MarketingTemplateBannerBlock => ({
  type: MarketingTemplateBlocks.BANNER,
  content: blockItem.collection.map((item) => ({
    title: item.title,
    // description: item.description?.json, // TODO
    description: 'zelipapoo',
    cta: item.cta,
  })),
})
