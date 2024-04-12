import { OmniProductType } from 'features/omni-kit/types'
import { getGenericPositionUrl } from 'features/productHub/helpers'
import { featuredProducts } from 'features/productHub/meta'
import type { ProductHubItem } from 'features/productHub/types'

export const getProductMultiplyNavItems = (productHub: ProductHubItem[]) => {
  return productHub
    .filter((product) =>
      featuredProducts.multiply?.some(
        (featured) =>
          (featured.label ? featured.label === product.label : true) &&
          product.primaryToken === featured.primaryToken &&
          product.secondaryToken === featured.secondaryToken &&
          product.protocol === featured.protocol &&
          product.network === featured.network &&
          product.product.includes(OmniProductType.Multiply),
      ),
    )
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
