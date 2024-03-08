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

  // for now switch only uses one case, but it's safe to assume that those filters will grown and it's easier to work from that position
  switch (key) {
    case 'rewardsOnly':
      delete queryString.rewardsOnly

      return {
        ...queryString,
        ...(value?.[0] === true && { rewardsOnly: [true] }),
      }
    default:
      return {
        ...queryString,
        ...(value && value.length < maxLength && { [key]: value }),
      }
  }
}
