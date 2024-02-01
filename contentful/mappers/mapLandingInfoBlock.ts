import type { LandingPageInfo } from 'contentful/types'
import type { MarketingTemplateInfoBoxBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingInfoBlock = (blockItem: LandingPageInfo): MarketingTemplateInfoBoxBlock => ({
  type: MarketingTemplateBlocks.INFO_BOX,
  title: blockItem.title,
  // description: blockItem.description, // TODO
  description: 'zelipapo',
  content: blockItem.collection.map((item) => ({
    title: item.title,
    // description: item.description,
    description: 'zelipapo', // TODO
    image: item.image.url,
    tokens: item.tokens,
  })),
})
