import type { ProductHubItem } from 'features/productHub/types'

export function findByIlk(products: ProductHubItem[], ilk: string) {
  return products.find((product) => product.label.includes(ilk))
}
