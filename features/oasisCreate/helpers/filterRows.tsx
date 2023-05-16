import {
  OasisCreateFilters,
  OasisCreateItem,
  OasisCreateItemBasics,
  ProductType,
} from 'features/oasisCreate/types'

export function filterRows(
  rows: OasisCreateItem[],
  product: ProductType,
  filters: OasisCreateFilters = {},
): OasisCreateItem[] {
  console.log(rows)
  console.log(filters)
  return rows
    .filter((item) => item.product === product || item.product.includes(product))
    .map((item) =>
      Array.isArray(item.network)
        ? item.network.map((network) => ({ ...item, network } as OasisCreateItem))
        : item,
    )
    .flat()
    .filter((item) =>
      Object.keys(filters).every((filter) => {
        const value = item[filter as keyof OasisCreateItemBasics]
        const selectedFilter = filters[filter as keyof typeof filters]

        return selectedFilter === value || selectedFilter?.includes(value as string)
      }),
    )
}
