import { mapCommonBlockProperties } from 'contentful/mappers/mapCommonBlockProperties'
import type { LandingPageInfo } from 'contentful/types'
import type { MarketingTemplateInfoBoxBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingInfoBlock = (blockItem: LandingPageInfo): MarketingTemplateInfoBoxBlock => ({
  ...mapCommonBlockProperties(blockItem),
  type: MarketingTemplateBlocks.INFO_BOX,
  content: blockItem.collection.map((item) => ({
    title: item.title,
    description: item.description.json,
    image: item.image.url,
    tokens: item.tokens,
    ...(item.link && {
      link: {
        label: item.link.label,
        url: item.link.url,
      },
    }),
  })),
})
