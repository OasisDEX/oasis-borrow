import type { AssetsTableRowData } from 'components/assetsTable/types'

export function getRowKey(i: number, row: AssetsTableRowData) {
  return [
    ...(row.items.asset ? [row.items.asset] : []),
    ...(row.items.cdpId ? [row.items.cdpId] : []),
    i,
  ].join('-')
}
