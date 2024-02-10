import { mapCommonBlockProperties } from 'contentful/mappers/mapCommonBlockProperties'
import type { LandingPageProduct } from 'contentful/types'
import type { MarketingTemplateProductBoxBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingPageProductBlock = (
  blockItem: LandingPageProduct,
): MarketingTemplateProductBoxBlock => ({
  ...mapCommonBlockProperties(blockItem),
  type: MarketingTemplateBlocks.PRODUCT_BOX,
  content: blockItem.collection.map((item) => ({
    title: item.title,
    link: item.link,
    type: item.type,
    ...(item.description && {
      description: item.description.json,
    }),
    composition: item.composition,
    ...(item.actionsListCollection.items.length && {
      actionsList: item.actionsListCollection.items.map((actionItem) => ({
        icon: actionItem.icon.url,
        label: actionItem.label,
        ...(actionItem.description ? { description: actionItem.description } : {}),
      })),
    }),
    ...(item.image && {
      image: item.image.url,
    }),
    ...(item.contentImage && {
      contentImage: item.contentImage.url,
    }),
  })),
})
