import type { ProductHubItem, ProductHubProductType } from 'features/productHub/types'

export function filterByProductType(
  rows: ProductHubItem[],
  selectedProduct: ProductHubProductType,
): ProductHubItem[] {
  return rows.filter((item) => item.product.includes(selectedProduct))
}
