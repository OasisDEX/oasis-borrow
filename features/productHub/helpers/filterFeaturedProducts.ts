import type { ProductHubFeaturedProducts, ProductHubItem } from 'features/productHub/types'

interface FilterFeaturedProductsParams {
  filters: ProductHubFeaturedProducts
  rows: ProductHubItem[]
}

export function filterFeaturedProducts({
  filters,
  rows,
}: FilterFeaturedProductsParams): ProductHubItem[] {
  return rows
    .map((row) => ({
      ...row,
      index: filters.products.findIndex((featured) =>
        Object.entries(featured).every(([key, value]) =>
          key === 'product'
            ? row.product.includes(featured.product)
            : String(row[key as keyof typeof row]).toLowerCase() === String(value).toLowerCase(),
        ),
      ),
    }))
    .filter(({ index }) => index > -1)
    .sort((a, b) => a.index - b.index)
    .slice(0, 'limit' in filters ? filters.limit : undefined)
    .map(({ index, ...item }) => item)
}
