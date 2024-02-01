import { mapCommonBlockProperties } from 'contentful/mappers/mapCommonBlockProperties'
import type { LandingPageBanner } from 'contentful/types'
import type { MarketingTemplateBannerBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingPageBannerBlock = (
  blockItem: LandingPageBanner,
): MarketingTemplateBannerBlock => ({
  ...mapCommonBlockProperties(blockItem),
  type: MarketingTemplateBlocks.BANNER,
  content: blockItem.collection.map((item) => ({
    title: item.title,
    ...(item.description?.json ? { description: JSON.stringify(item.description.json) } : {}),
    cta: item.cta,
  })),
})
