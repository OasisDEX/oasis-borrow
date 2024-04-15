import { filterByCategory } from 'features/productHub/helpers'
import type {
  ProductHubCategory,
  ProductHubFilters,
  ProductHubItem,
} from 'features/productHub/types'

export function filterByUserFilters(
  rows: ProductHubItem[],
  filters: ProductHubFilters,
): ProductHubItem[] {
  return rows.filter((row) =>
    Object.keys(filters).every((k) => {
      const value = filters[k]

      if (value.length) {
        const primaryToken = row.reverseTokens ? row.secondaryToken : row.primaryToken
        const secondaryToken = row.reverseTokens ? row.primaryToken : row.secondaryToken

        switch (k) {
          case 'category':
            return filterByCategory({
              category: filters[k][0] as ProductHubCategory,
              primaryToken,
              row,
              secondaryToken,
            })
          case 'collateral-token':
            return value.includes(primaryToken)
          case 'debt-token':
            return value.includes(secondaryToken)
          case 'deposit-token':
            return row.depositToken && value.includes(row.depositToken)
          case 'protocol':
            return value.includes(row.protocol)
          case 'network':
            return value.includes(row.network)
          default:
            return true
        }
      } else return true
    }),
  )
}
