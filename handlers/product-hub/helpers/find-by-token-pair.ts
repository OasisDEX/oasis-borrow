import type { ProductHubItem } from 'features/productHub/types'

export function findByTokenPair(products: ProductHubItem[], pool: [string, string]) {
  return products.find(
    (product) => product.primaryToken === pool[0] && product.secondaryToken === pool[1],
  )
}
