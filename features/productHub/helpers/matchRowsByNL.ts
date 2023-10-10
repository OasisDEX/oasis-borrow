import { ALL_ASSETS } from 'features/productHub/meta'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'

export function matchRowsByNL(
  rows: ProductHubItem[],
  product: ProductHubProductType,
  token: string,
): ProductHubItem[] {
  return rows
    .filter((item) => item.product.includes(product))
    .filter((item) =>
      token === ALL_ASSETS
        ? true
        : [
            item.primaryToken,
            item.primaryTokenGroup,
            ...(product === ProductHubProductType.Multiply
              ? [item.secondaryToken, item.secondaryTokenGroup]
              : []),
          ].some((value) => value === token),
    )
}
