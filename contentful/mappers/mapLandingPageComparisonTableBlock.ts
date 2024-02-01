import type { LandingPageComparisonTable } from 'contentful/types'
import type { MarketingTemplateComparisonTableBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingPageComparisonTableBlock = (
  blockItem: LandingPageComparisonTable,
): MarketingTemplateComparisonTableBlock => ({
  type: MarketingTemplateBlocks.COMPARISON_TABLE,
  title: blockItem.title,
  content: blockItem.collection.map((item) => item.table),
})
