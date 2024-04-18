import BigNumber from 'bignumber.js'
import { OmniProductType } from 'features/omni-kit/types'
import { getGenericPositionUrl } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'

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

export function sortByDefault(
  rows: ProductHubItem[],
  selectedProduct: OmniProductType,
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

      return getGenericPositionUrl({
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
    case OmniProductType.Borrow:
      return [
        ...sortByProductValue('fee', available),
        ...sortByProductValue('fee', comingSoon),
      ]
    case OmniProductType.Multiply:
      return [
        ...sortByProductValue('maxMultiply', available, -1),
        ...sortByProductValue('maxMultiply', comingSoon, -1),
      ]
    case OmniProductType.Earn:
      return [
        ...sortByProductValue('weeklyNetApy', available, -1),
        ...sortByProductValue('weeklyNetApy', comingSoon, -1),
      ]
  }
}
