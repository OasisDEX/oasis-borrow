import { EMPTY_FILTERS } from 'features/oasisCreate/meta'
import {
  OasisCreateFilters,
  OasisCreateFiltersCriteria,
  OasisCreateItem,
  OasisCreateItemBasics,
} from 'features/oasisCreate/types'

export function matchRowsByFilters(
  rows: OasisCreateItem[],
  filters: OasisCreateFilters = EMPTY_FILTERS,
): OasisCreateItem[] {
  return rows
    .filter((item) => {
      return filters.or.length
        ? filters.or.some((or) => {
            return Object.keys(or).every((filter) =>
              or[filter as keyof OasisCreateFiltersCriteria]?.includes(
                item[filter as keyof OasisCreateItemBasics] as never,
              ),
            )
          })
        : true
    })
    .filter((item) =>
      Object.keys(filters.and).every((filter) =>
        filters.and[filter as keyof OasisCreateFiltersCriteria]?.includes(
          item[filter as keyof OasisCreateItemBasics] as never,
        ),
      ),
    )
}
