import type { ProductHubFeaturedFilters, ProductHubItem } from 'features/productHub/types'

interface FilterFeaturedProductsParams {
  filters: ProductHubFeaturedFilters[]
  rows: ProductHubItem[]
}

export function filterFeaturedProducts({ filters, rows }: FilterFeaturedProductsParams) {
  return rows.filter((row) =>
    filters.some(
      (featured) =>
        (featured.label ? featured.label === row.label : true) &&
        row.primaryToken.toLowerCase() === featured.primaryToken.toLowerCase() &&
        row.secondaryToken.toLowerCase() === featured.secondaryToken.toLowerCase() &&
        row.protocol === featured.protocol &&
        row.network === featured.network &&
        row.product.includes(featured.product),
    ),
  )
}
