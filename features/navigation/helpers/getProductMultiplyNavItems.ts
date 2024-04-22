import { featuredMultiplyNavigationProducts } from 'features/navigation/meta'
import { OmniProductType } from 'features/omni-kit/types'
import { filterFeaturedProducts, getGenericPositionUrl } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'

export const getProductMultiplyNavItems = (productHub: ProductHubItem[]) => {
  return filterFeaturedProducts({
    filters: {
      products: featuredMultiplyNavigationProducts,
    },
    rows: productHub,
  })
    .map((product) => ({
      maxMultiply: product.maxMultiply ? Number(product.maxMultiply) : undefined,
      collateralToken: product.primaryToken,
      debtToken: product.secondaryToken,
      protocol: product.protocol,
      network: product.network,
      url: getGenericPositionUrl({
        ...product,
        product: [OmniProductType.Multiply],
      }),
    }))
    .sort((a, b) => (b.maxMultiply ?? 0) - (a.maxMultiply ?? 0))
}
