import {
  OasisCreateFilters,
  OasisCreateFiltersCriteria,
  OasisCreateItem,
  OasisCreateItemBasics,
} from 'features/oasisCreate/types'

function filterByCriteria(criteria: OasisCreateFiltersCriteria, item: OasisCreateItem) {
  return Object.keys(criteria).every((filter) =>
    criteria[filter as keyof OasisCreateFiltersCriteria]?.includes(
      item[filter as keyof OasisCreateItemBasics] as never,
    ),
  )
}

export function matchRowsByFilters(
  rows: OasisCreateItem[],
  { or, and }: OasisCreateFilters,
): OasisCreateItem[] {
  return rows
    .filter((item) => (or.length ? or.some((criteria) => filterByCriteria(criteria, item)) : true))
    .filter((item) => filterByCriteria(and, item))
}
