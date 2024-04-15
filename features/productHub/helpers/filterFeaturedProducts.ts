import type { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubItem, ProductHubPromoCardFilters } from 'features/productHub/types'

interface FilterFeaturedProductsParams {
  filters: ProductHubPromoCardFilters[]
  productType: OmniProductType
  rows: ProductHubItem[]
}

export function filterFeaturedProducts({
  filters,
  productType,
  rows,
}: FilterFeaturedProductsParams) {
  return rows.filter((product) =>
    filters.some(
      (featured) =>
        (featured.label ? featured.label === product.label : true) &&
        product.primaryToken === featured.primaryToken &&
        product.secondaryToken === featured.secondaryToken &&
        product.protocol === featured.protocol &&
        product.network === featured.network &&
        product.product.includes(productType),
    ),
  )
}
