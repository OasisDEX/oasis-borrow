import type { BlocksCollection } from 'contentful/types'
import type { MarketingTemplateBlock } from 'features/marketing-layouts/types'

export const mapCommonBlockProperties = (blockItem: BlocksCollection): MarketingTemplateBlock => ({
  ...(blockItem.title && { title: blockItem.title }),
  ...(blockItem.subtitle && { subtitle: blockItem.subtitle }),
  ...(blockItem.footer && { footer: blockItem.footer.json }),
  ...(blockItem.description && { description: blockItem.description.json }),
})
