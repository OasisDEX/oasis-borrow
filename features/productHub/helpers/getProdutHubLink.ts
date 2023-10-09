import type { ProductHubProductType, ProductHubQueryString } from 'features/productHub/types'
import { compact } from 'lodash'

interface GetProdutHubLinkParams {
  prefix?: string
  product: ProductHubProductType
  query?: ProductHubQueryString
  token?: string
}

export function getProdutHubLink({
  prefix,
  product,
  query,
  token,
}: GetProdutHubLinkParams): string {
  const base = compact([prefix, product, token]).join('/')
  const queryString = query
    ? Object.keys(query).reduce<string>(
        (sum, key, i) =>
          `${sum}${i > 0 ? '&' : '?'}${key}=${query[key as keyof typeof query]?.join(',')}`,
        '',
      )
    : ''

  return `/${base}${queryString}`
}
