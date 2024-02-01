import { mapCommonBlockProperties } from 'contentful/mappers/mapCommonBlockProperties'
import type { LandingPageBenefit } from 'contentful/types'
import type { MarketingTemplateBenefitBoxBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingPageBenefitBlock = (
  blockItem: LandingPageBenefit,
): MarketingTemplateBenefitBoxBlock => ({
  ...mapCommonBlockProperties(blockItem),
  type: MarketingTemplateBlocks.BENEFIT_BOX,
  content: blockItem.collection.map((item) => ({
    title: item.title,
    icon: item.icon.url,
    description: JSON.stringify(item.description?.json),
  })),
})
