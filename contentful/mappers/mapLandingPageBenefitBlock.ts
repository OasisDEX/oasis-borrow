import type { LandingPageBenefit } from 'contentful/types'
import type { MarketingTemplateBenefitBoxBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingPageBenefitBlock = (
  blockItem: LandingPageBenefit,
): MarketingTemplateBenefitBoxBlock => ({
  type: MarketingTemplateBlocks.BENEFIT_BOX,
  title: blockItem.title,
  subtitle: blockItem.title,
  content: blockItem.collection.map((item) => ({
    title: item.title,
    // description: item.description,
    description: 'zelipapo',
    icon: item.icon.url,
  })),
})
