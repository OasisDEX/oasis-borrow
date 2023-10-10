import type {
  ProductHubFilters,
  ProductHubFiltersCriteria,
  ProductHubItem,
  ProductHubItemBasics,
} from 'features/productHub/types'

function filterByCriteria(criteria: ProductHubFiltersCriteria, item: ProductHubItem) {
  return Object.keys(criteria).every((filter) =>
    criteria[filter as keyof ProductHubFiltersCriteria]?.includes(
      item[filter as keyof ProductHubItemBasics] as never,
    ),
  )
}

export function matchRowsByFilters(
  rows: ProductHubItem[],
  { or, and }: ProductHubFilters,
): ProductHubItem[] {
  return rows
    .filter((item) => (or.length ? or.some((criteria) => filterByCriteria(criteria, item)) : true))
    .filter((item) => filterByCriteria(and, item))
}
