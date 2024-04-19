import { OmniProductType } from 'features/omni-kit/types'
import { filterByCategory, filterByTags, filterFeaturedProducts } from 'features/productHub/helpers'
import { MIN_LIQUIDITY } from 'features/productHub/meta'
import type {
  ProductHubCategory,
  ProductHubFeaturedFilters,
  ProductHubFilters,
  ProductHubItem,
  ProductHubTag,
} from 'features/productHub/types'

export function filterByUserFilters(
  rows: ProductHubItem[],
  selectedFilters: ProductHubFilters,
  selectedProduct: OmniProductType,
  stickied: ProductHubFeaturedFilters[] = [],
): ProductHubItem[] {
  const stickiedRows = filterFeaturedProducts({ filters: stickied, rows })

  return rows.filter((row) =>
    stickiedRows.includes(row)
      ? true
      : Object.keys(selectedFilters).every((k) => {
          const value = selectedFilters[k]

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
                  category: selectedFilters.category[0] as ProductHubCategory,
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
                  tags: selectedFilters.tags as ProductHubTag[],
                })
              default:
                return true
            }
          } else return true
        }) &&
        (selectedProduct !== OmniProductType.Earn
          ? Number(row.liquidity) >= Number(selectedFilters['min-liquidity'] ?? MIN_LIQUIDITY)
          : true),
  )
}
