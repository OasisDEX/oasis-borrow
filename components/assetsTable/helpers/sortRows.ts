import type {
  AssetsTableRowData,
  AssetsTableSortableCell,
  AssetsTableSortingSettings,
} from 'components/assetsTable/types'

interface SortRowsProps {
  rows: AssetsTableRowData[]
  sortingSettings: AssetsTableSortingSettings
}

export function sortRows({ rows, sortingSettings }: SortRowsProps): AssetsTableRowData[] {
  return [...rows].sort((a, b) => {
    const sortableA = (a.items[sortingSettings.key] as AssetsTableSortableCell)?.sortable ?? 0
    const sortableB = (b.items[sortingSettings.key] as AssetsTableSortableCell)?.sortable ?? 0

    if (sortableA === sortableB) return 0
    else if (sortingSettings.direction === 'asc') return sortableA > sortableB ? 1 : -1
    else return sortableA < sortableB ? 1 : -1
  })
}
