import {
  AssetsTableRowData,
  AssetsTableSortableCell,
  AssetsTableSortingDirection,
} from 'components/assetsTable/types'

interface SortRowsProps {
  rows: AssetsTableRowData[]
  sortingKey: string
  sortingDirection: AssetsTableSortingDirection
}

export function sortRows({
  rows,
  sortingKey,
  sortingDirection,
}: SortRowsProps): AssetsTableRowData[] {
  return [...rows].sort((a, b) => {
    const sortableA = (a[sortingKey] as AssetsTableSortableCell).sortable
    const sortableB = (b[sortingKey] as AssetsTableSortableCell).sortable

    if (sortableA === sortableB) return 0
    else if (sortingDirection === 'asc') return sortableA > sortableB ? 1 : -1
    else return sortableA < sortableB ? 1 : -1
  })
}
