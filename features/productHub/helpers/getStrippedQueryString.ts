import type { ProductHubQueryString } from 'features/productHub/types'

interface GetStrippedQueryString {
  queryString: ProductHubQueryString
}

export function getStrippedQueryString({
  queryString,
}: GetStrippedQueryString): ProductHubQueryString {
  return Object.keys(queryString).reduce<ProductHubQueryString>(
    (sum, key) => ({
      ...sum,
      ...(key !== 'debtToken' &&
        key !== 'secondaryToken' && {
          [key]: queryString[key as keyof typeof queryString],
        }),
    }),
    {},
  )
}
