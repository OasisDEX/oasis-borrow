import { mapCommonBlockProperties } from 'contentful/mappers/mapCommonBlockProperties'
import type { LandingPageComparisonTable } from 'contentful/types'
import type { MarketingTemplateComparisonTableBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingPageComparisonTableBlock = (
  blockItem: LandingPageComparisonTable,
): MarketingTemplateComparisonTableBlock => ({
  ...mapCommonBlockProperties(blockItem),
  type: MarketingTemplateBlocks.COMPARISON_TABLE,
  content: blockItem.collection.map((item) => item.table),
})
