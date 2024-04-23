import type { ProductHubDatabaseQuery, ProductHubItem } from 'features/productHub/types'

export function filterByDatabaseQuery(
  rows: ProductHubItem[],
  databaseQuery: ProductHubDatabaseQuery,
): ProductHubItem[] {
  return rows.filter((row) =>
    Object.entries(databaseQuery).every(
      ([key, value]) =>
        String(row[key as keyof typeof row]).toLowerCase() === String(value).toLowerCase(),
    ),
  )
}
