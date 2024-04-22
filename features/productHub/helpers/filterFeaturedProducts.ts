import type { ProductHubFeaturedFilters, ProductHubItem } from 'features/productHub/types'

interface FilterFeaturedProductsParams {
  filters: ProductHubFeaturedFilters[]
  rows: ProductHubItem[]
}

export function filterFeaturedProducts({ filters, rows }: FilterFeaturedProductsParams) {
  return rows.filter((row) =>
    filters.some((featured) =>
      Object.entries(featured).every(([key, value]) =>
        key === 'product'
          ? row.product.includes(value)
          : String(row[key as keyof typeof row]).toLowerCase() === String(value).toLowerCase(),
      ),
    ),
  )
}
