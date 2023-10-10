import type { AssetsTableRowData } from 'components/assetsTable/types'

export function getRowKey(i: number, row: AssetsTableRowData) {
  return [...(row.asset ? [row.asset] : []), ...(row.cdpId ? [row.cdpId] : []), i].join('-')
}
