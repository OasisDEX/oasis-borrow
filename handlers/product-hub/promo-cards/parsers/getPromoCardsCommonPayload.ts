import { NetworkNames } from 'blockchain/networks'
import { getActionUrl } from 'features/productHub/helpers'
import type { ProductHubProductType } from 'features/productHub/types'
import { getMaxLtvPill, getUpToYieldExposurePill } from 'handlers/product-hub/promo-cards/parsers'
import type { ParsePromoCardParams } from 'handlers/product-hub/types'

export function getPromoCardsCommonPayload({
  collateralToken,
  debtToken,
  network = NetworkNames.ethereumMainnet,
  pills,
  product,
  productType,
  protocol,
  withMaxLtvPill,
  withYieldExposurePillPill,
}: ParsePromoCardParams & { productType: ProductHubProductType }) {
  return {
    tokens: [collateralToken.toUpperCase(), debtToken.toUpperCase()],
    protocol: {
      network,
      protocol,
    },
    pills: [
      ...(withMaxLtvPill && product?.maxLtv
        ? [
            {
              ...getMaxLtvPill(product.maxLtv),
            },
          ]
        : []),
      ...(withYieldExposurePillPill && product?.maxMultiply
        ? [
            {
              ...getUpToYieldExposurePill(product.maxMultiply),
            },
          ]
        : []),
      ...(pills || []),
    ],
    ...(product && {
      link: {
        href: getActionUrl({
          bypassFeatureFlag: true,
          ...product,
          product: [productType],
        }),
      },
    }),
  }
}
