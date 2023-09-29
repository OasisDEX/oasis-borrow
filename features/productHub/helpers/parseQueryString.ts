import type { ProductHubQueryString } from 'features/productHub/types'

export function parseQueryString<T extends keyof ProductHubQueryString>({
  key,
  maxLength,
  queryString,
  value,
}: {
  key: T
  maxLength: number
  queryString: ProductHubQueryString
  value: ProductHubQueryString[T]
}): ProductHubQueryString {
  delete queryString[key]

  return {
    ...queryString,
    ...(value && value.length < maxLength && { [key]: value }),
  }
}
