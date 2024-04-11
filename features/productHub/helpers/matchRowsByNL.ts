import type { ProductHubItem , ProductHubProductType } from 'features/productHub/types'

export function matchRowsByNL(
  rows: ProductHubItem[],
  product: ProductHubProductType,
): ProductHubItem[] {
  return rows.filter((item) => item.product.includes(product))
}
