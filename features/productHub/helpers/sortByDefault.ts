import BigNumber from 'bignumber.js'
import { getActionUrl } from 'features/productHub/helpers'
import { MIN_LIQUIDITY } from 'features/productHub/meta'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'

function sortByProductValue(
  param: keyof ProductHubItem,
  rows: ProductHubItem[],
  asc: 1 | -1 = 1,
): ProductHubItem[] {
  return rows.sort((a, b) =>
    a[param] && b[param]
      ? new BigNumber(a[param] as string)
          .minus(new BigNumber(b[param] as string))
          .times(asc)
          .toNumber()
      : a[param]
      ? -1
      : 1,
  )
}

function filterOutLowLiquidityProducts({ liquidity }: ProductHubItem) {
  return liquidity && new BigNumber(liquidity).gte(MIN_LIQUIDITY)
}

export function sortByDefault(
  rows: ProductHubItem[],
  selectedProduct: ProductHubProductType,
): ProductHubItem[] {
  const { available, comingSoon } = rows.reduce<{
    available: ProductHubItem[]
    comingSoon: ProductHubItem[]
  }>(
    ({ available, comingSoon }, current) => {
      const {
        earnStrategy,
        label,
        network,
        primaryToken,
        primaryTokenAddress,
        product,
        protocol,
        secondaryToken,
        secondaryTokenAddress,
      } = current

      return getActionUrl({
        bypassFeatureFlag: false,
        earnStrategy,
        label,
        network,
        primaryToken,
        primaryTokenAddress,
        product,
        protocol,
        secondaryToken,
        secondaryTokenAddress,
      }) === '/'
        ? { available, comingSoon: [...comingSoon, current] }
        : { available: [...available, current], comingSoon }
    },
    { available: [], comingSoon: [] },
  )

  switch (selectedProduct) {
    case ProductHubProductType.Borrow:
      return [
        ...sortByProductValue('fee', available),
        ...sortByProductValue('fee', comingSoon),
      ]
    case ProductHubProductType.Multiply:
      return [
        ...sortByProductValue('maxMultiply', available, -1),
        ...sortByProductValue('maxMultiply', comingSoon, -1),
      ]
    case ProductHubProductType.Earn:
      return [
        ...sortByProductValue('weeklyNetApy', available, -1),
        ...sortByProductValue('weeklyNetApy', comingSoon, -1),
      ]
  }
}
