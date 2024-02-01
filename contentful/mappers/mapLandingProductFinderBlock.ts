import { mapCommonBlockProperties } from 'contentful/mappers/mapCommonBlockProperties'
import type { ProductFinder } from 'contentful/types'
import type {
  MarketingProductFinderPromoCards,
  MarketingTemplateProductFinderBlock,
} from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'

export const mapLandingProductFinderBlock = (
  blockItem: ProductFinder,
): MarketingTemplateProductFinderBlock => ({
  ...mapCommonBlockProperties(blockItem),
  type: MarketingTemplateBlocks.PRODUCT_FINDER,
  content: blockItem.collection.map((item) => ({
    product: item.product.slug,
    initialProtocol: item.initialProtocolCollection.items.map((protocolItem) => protocolItem.slug),
    promoCards: item.promoCardsCollection.items.map((promoCard) => ({
      network: promoCard.network.slug,
      primaryToken: promoCard.primaryToken,
      secondaryToken: promoCard.secondaryToken,
      product: promoCard.product.slug,
      protocol: promoCard.protocol.slug,
    })) as MarketingProductFinderPromoCards,
  })),
})
