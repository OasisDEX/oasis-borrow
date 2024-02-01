import type { BlocksCollection } from 'contentful/types'
import type { MarketingTemplateBlock } from 'features/marketing-layouts/types'

export const mapCommonBlockProperties = (blockItem: BlocksCollection): MarketingTemplateBlock => ({
  ...(blockItem.title ? { subtitle: blockItem.title } : {}),
  ...(blockItem.subtitle ? { subtitle: blockItem.subtitle } : {}),
  ...(blockItem.footer?.json ? { footer: JSON.stringify(blockItem.footer.json) } : {}),
  ...(blockItem.description?.json
    ? { description: JSON.stringify(blockItem.description.json) }
    : {}),
})
