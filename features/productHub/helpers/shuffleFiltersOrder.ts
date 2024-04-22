import type { ProductHubFeaturedProducts } from 'features/productHub/types'
import { shuffle } from 'lodash'

export function shuffleFiltersOrder(
  filters?: ProductHubFeaturedProducts,
): ProductHubFeaturedProducts {
  return filters ? { ...filters, products: shuffle(filters.products) } : { products: [] }
}
