import { ALL_ASSETS } from 'features/productHub/meta'
import { ProductHubItem, ProductType } from 'features/productHub/types'

export function matchRowsByNL(
  rows: ProductHubItem[],
  product: ProductType,
  token: string,
): ProductHubItem[] {
  return rows
    .filter((item) => item.product === product || item.product.includes(product))
    .filter((item) =>
      token === ALL_ASSETS
        ? true
        : [
            item.primaryToken,
            item.primaryTokenGroup,
            ...(product === ProductType.Multiply
              ? [item.secondaryToken, item.secondaryTokenGroup]
              : []),
          ].some((value) => value === token),
    )
}
