import { filterByCategory, filterByTags } from 'features/productHub/helpers'
import type {
  ProductHubCategory,
  ProductHubFilters,
  ProductHubItem,
  ProductHubTag,
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
        const primaryTokenGroup = row.reverseTokens
          ? row.secondaryTokenGroup ?? row.secondaryToken
          : row.primaryTokenGroup ?? row.primaryToken
        const secondaryToken = row.reverseTokens ? row.primaryToken : row.secondaryToken
        const secondaryTokenGroup = row.reverseTokens
          ? row.primaryTokenGroup ?? row.primaryToken
          : row.secondaryTokenGroup ?? row.secondaryToken

        switch (k) {
          case 'category':
            return filterByCategory({
              category: filters.category[0] as ProductHubCategory,
              primaryToken,
              primaryTokenGroup,
              row,
              secondaryToken,
              secondaryTokenGroup,
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
          case 'tags':
            return filterByTags({
              primaryToken,
              primaryTokenGroup,
              row,
              secondaryToken,
              secondaryTokenGroup,
              tags: filters.tags as ProductHubTag[],
            })
          default:
            return true
        }
      } else return true
    }),
  )
}
