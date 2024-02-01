import type { LandingPageProduct } from 'contentful/types'
import type { MarketingTemplateProductBoxBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingPageProductBlock = (
  blockItem: LandingPageProduct,
): MarketingTemplateProductBoxBlock => ({
  type: MarketingTemplateBlocks.PRODUCT_BOX,
  title: blockItem.title,
  content: blockItem.collection.map((item) => ({
    title: item.title,
    link: item.link,
    type: item.type,
    // description: item.description.json,
    description: 'zelipapo', // TODO
    composition: item.composition,
    actionsList: item.actionsListCollection.items.map((actionItem) => ({
      icon: actionItem.icon.url,
      label: actionItem.label,
      ...(actionItem.description ? { description: actionItem.description } : {}),
    })),
    ...(item.image ? { image: item.image.url } : {}),
  })),
})
