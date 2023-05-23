import { ALL_ASSETS } from 'features/oasisCreate/meta'
import { OasisCreateItem, ProductType } from 'features/oasisCreate/types'

export function matchRowsByNL(
  rows: OasisCreateItem[],
  product: ProductType,
  token: string,
): OasisCreateItem[] {
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
