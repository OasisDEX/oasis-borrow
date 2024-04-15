import type { ProductHubItem, ProductHubFeaturedFilters } from 'features/productHub/types'

interface FilterFeaturedProductsParams {
  filters: ProductHubFeaturedFilters[]
  rows: ProductHubItem[]
}

export function filterFeaturedProducts({ filters, rows }: FilterFeaturedProductsParams) {
  return rows.filter((row) =>
    filters.some(
      (featured) =>
        (featured.label ? featured.label === row.label : true) &&
        row.primaryToken === featured.primaryToken &&
        row.secondaryToken === featured.secondaryToken &&
        row.protocol === featured.protocol &&
        row.network === featured.network &&
        row.product.includes(featured.product),
    ),
  )
}
