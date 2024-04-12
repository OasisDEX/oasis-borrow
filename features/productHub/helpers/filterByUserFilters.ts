import type { ProductHubFilters, ProductHubItem } from 'features/productHub/types'

export function filterByUserFilters(
  rows: ProductHubItem[],
  filters: ProductHubFilters,
): ProductHubItem[] {
  return rows.filter((row) =>
    Object.keys(filters).every((k) => {
      const value = filters[k]

      if (value.length) {
        switch (k) {
          case 'collateral-token':
            return value.includes(row.reverseTokens ? row.secondaryToken : row.primaryToken)
          case 'debt-token':
            return value.includes(row.reverseTokens ? row.primaryToken : row.secondaryToken)
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
