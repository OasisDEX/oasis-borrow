import {
  OasisCreateFilters,
  OasisCreateItem,
  OasisCreateItemBasics,
} from 'features/oasisCreate/types'

export function matchRowsByFilters(
  rows: OasisCreateItem[],
  filters: OasisCreateFilters = {},
): OasisCreateItem[] {
  return rows.filter((item) =>
    Object.keys(filters).every((filter) =>
      filters[filter as keyof OasisCreateFilters]?.includes(
        item[filter as keyof OasisCreateItemBasics] as never,
      ),
    ),
  )
}
