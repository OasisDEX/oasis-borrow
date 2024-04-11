import type { ProductHubItem } from 'features/productHub/types'
import { uniq } from 'lodash'

interface GetTokensFilterOptionsParams {
  data: ProductHubItem[]
  key: 'primaryToken' | 'secondaryToken' | 'depositToken'
}

export function getTokensFilterOptions({ data, key }: GetTokensFilterOptionsParams) {
  return uniq(data.map((item) => item[key] ?? item.primaryToken))
    .sort()
    .map((item) => ({
      label: item,
      value: item,
      token: item,
    }))
}
