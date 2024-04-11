import type {
  ProductHubFilters,
  ProductHubItem,
  ProductHubItemBasics,
} from 'features/productHub/types'

export function matchRowsByFilters(
  rows: ProductHubItem[],
  filters: ProductHubFilters,
): ProductHubItem[] {
  return rows.filter((item) =>
    Object.keys(filters).every((filter) =>
      filters[filter as keyof ProductHubFilters]?.includes(
        item[filter as keyof ProductHubItemBasics] as never,
      ),
    ),
  )
}
