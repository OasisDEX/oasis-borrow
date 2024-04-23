import type { ProductHubFilters } from 'features/productHub/types'
import type { ReadonlyURLSearchParams } from 'next/navigation'

interface ParseQueryStringParams {
  searchParams: ReadonlyURLSearchParams
}

export function parseQueryString({ searchParams }: ParseQueryStringParams) {
  return Object.entries(Object.fromEntries(searchParams.entries())).reduce<ProductHubFilters>(
    (total, [key, value]) => ({
      ...total,
      [key]: value.split(','),
    }),
    {},
  )
}
