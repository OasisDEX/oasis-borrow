import type { ProductHubQueryString } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'

interface GetStrippedQueryString {
  selectedProduct: ProductHubProductType
  queryString: ProductHubQueryString
}

export function getStrippedQueryString({
  selectedProduct,
  queryString,
}: GetStrippedQueryString): ProductHubQueryString {
  return Object.keys(queryString).reduce<ProductHubQueryString>(
    (sum, key) => ({
      ...sum,
      ...(!(
        (key === 'debtToken' && selectedProduct !== ProductHubProductType.Borrow) ||
        ((key === 'secondaryToken' || key === 'strategy') &&
          selectedProduct !== ProductHubProductType.Multiply)
      ) && {
        [key]: queryString[key as keyof typeof queryString],
      }),
    }),
    {},
  )
}
