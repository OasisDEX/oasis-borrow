import { mapCommonBlockProperties } from 'contentful/mappers/mapCommonBlockProperties'
import type { ProductFinder } from 'contentful/types'
import type { MarketingTemplateProductFinderBlock } from 'features/marketing-layouts/types'
import { MarketingTemplateBlocks } from 'features/marketing-layouts/types'
import type { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubSupportedNetworks } from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'

export const mapLandingProductFinderBlock = (
  blockItem: ProductFinder,
): MarketingTemplateProductFinderBlock => ({
  ...mapCommonBlockProperties(blockItem),
  type: MarketingTemplateBlocks.PRODUCT_FINDER,
  content: blockItem.collection.map((item) => {
    const filters = item.promoCardsCollection?.items.map((promoCard) => ({
      network: promoCard.network.slug as ProductHubSupportedNetworks,
      primaryToken: promoCard.primaryToken,
      secondaryToken: promoCard.secondaryToken,
      product: promoCard.product.slug as OmniProductType,
      protocol: promoCard.protocol.slug as LendingProtocol,
      ...(promoCard.label && {
        label: promoCard.label,
      }),
    }))

    return {
      product: item.product.slug,
      initialFilters: {
        ...(item.collateralToken && { 'collateral-token': item.collateralToken }),
        ...(item.debtToken && { 'debt-token': item.debtToken }),
        ...(item.depositToken && { 'deposit-token': item.depositToken }),
        ...(item.initialNetworkCollection && {
          network: uniq(item.initialNetworkCollection.items.map(({ slug }) => slug)),
        }),
        ...(item.initialProtocolCollection && {
          protocol: uniq(item.initialProtocolCollection.items.map(({ slug }) => slug)),
        }),
      },
      ...(filters && {
        featured: filters,
        highlighted: filters,
      }),
    }
  }),
})
