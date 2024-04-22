import type { ProductHubItem } from 'features/productHub/types'
import { uniq } from 'lodash'

interface GetTokensFilterOptionsParams {
  data: ProductHubItem[]
  featured?: string[]
  key: 'primaryToken' | 'secondaryToken' | 'depositToken'
}

export function getTokensFilterOptions({ data, featured = [], key }: GetTokensFilterOptionsParams) {
  const list = uniq(data.map((item) => item[key] ?? item.primaryToken))
  const [featuredList, nonFeaturedList] = list.reduce<[string[], string[]]>(
    ([_featuredList, _nonFeaturedList], token) =>
      featured.includes(token)
        ? [[..._featuredList, token], _nonFeaturedList]
        : [_featuredList, [..._nonFeaturedList, token]],
    [[], []],
  )

  return [
    featuredList.sort((a, b) => featured.indexOf(a) - featured.indexOf(b)),
    nonFeaturedList.sort(),
  ]
    .flat()
    .map((item) => ({
      label: item,
      value: item,
      token: item,
    }))
}
