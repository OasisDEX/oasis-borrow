import type { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubItem } from 'features/productHub/types'

export function filterByProductType(
  rows: ProductHubItem[],
  selectedProduct: OmniProductType,
): ProductHubItem[] {
  return rows.filter((item) => item.product.includes(selectedProduct))
}
