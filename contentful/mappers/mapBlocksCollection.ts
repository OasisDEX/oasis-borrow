import {
  mapLandingInfoBlock,
  mapLandingPageBannerBlock,
  mapLandingPageBenefitBlock,
  mapLandingPageProductBlock,
  mapLandingProductFinderBlock,
} from 'contentful/mappers'
import { mapLandingPageComparisonTableBlock } from 'contentful/mappers/mapLandingPageComparisonTableBlock'
import type {
  BlocksCollection,
  EntryCollectionRawItemResponse,
  LandingPageRawBlocksItems,
} from 'contentful/types'
import { LandingPageRawBlocks } from 'contentful/types'
import type { MarketingTemplateProductFinderBlocks } from 'features/marketing-layouts/types'

export const mapBlocksCollection = (
  blocksCollection: LandingPageRawBlocksItems[],
  entryCollection: EntryCollectionRawItemResponse[],
): MarketingTemplateProductFinderBlocks[] => {
  console.log(blocksCollection)
  console.log(entryCollection)
  const preparedBlocksCollection = blocksCollection.map((blockItem) => ({
    ...blockItem,
    type: blockItem.contentCollection.items[0].__typename,
    collection: blockItem.contentCollection.items.map((contentItem) =>
      entryCollection.find((item) => item.sys.id === contentItem.sys.id),
    ),
  })) as BlocksCollection[]

  return preparedBlocksCollection.flatMap((blockItem) => {
    switch (blockItem.type) {
      case LandingPageRawBlocks.BENEFIT_BOX: {
        return mapLandingPageBenefitBlock(blockItem)
      }
      case LandingPageRawBlocks.INFO_BOX: {
        return mapLandingInfoBlock(blockItem)
      }
      case LandingPageRawBlocks.PRODUCT_BOX: {
        return mapLandingPageProductBlock(blockItem)
      }
      case LandingPageRawBlocks.BANNER: {
        return mapLandingPageBannerBlock(blockItem)
      }
      case LandingPageRawBlocks.PRODUCT_FINDER: {
        return mapLandingProductFinderBlock(blockItem)
      }
      case LandingPageRawBlocks.COMPARISON_TABLE: {
        return mapLandingPageComparisonTableBlock(blockItem)
      }
      default:
        throw new Error(`Block item type not recognised ${(blockItem as BlocksCollection).type}`)
    }
  })
}
