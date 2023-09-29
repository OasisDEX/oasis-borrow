import type { ProductHubItem, ProductHubSupportedNetworks } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'

type ProductBorrowNavItem = {
  value: number
  protocol: LendingProtocol
  primaryToken: string
  secondaryToken: string
  network: ProductHubSupportedNetworks
}

type ProductBorrowNavItems = {
  maxLtv: ProductBorrowNavItem
  fee: ProductBorrowNavItem
  liquidity: ProductBorrowNavItem
}

const getProductBorrowInitNavItem = (startingValue: number): ProductBorrowNavItem => ({
  value: startingValue,
  primaryToken: '',
  secondaryToken: '',
  protocol: '' as LendingProtocol,
  network: '' as ProductHubSupportedNetworks,
})

export const getProductBorrowNavItems = (
  productHubItems: ProductHubItem[],
): ProductBorrowNavItems => {
  return productHubItems
    .filter((item) => item.product.includes(ProductHubProductType.Borrow))
    .reduce(
      (acc, curr) => {
        const accMaxLtvHigherThanCurr =
          acc.maxLtv.value > Number(curr.maxLtv) || Number(curr.maxLtv) > 1
        const accFeeLowerThanCurr = acc.fee.value < Number(curr.fee)
        const accLiquidityHigherThanCurr =
          acc.liquidity.value > Number(curr.liquidity) && curr.hasRewards

        return {
          ...acc,
          maxLtv: {
            value: accMaxLtvHigherThanCurr ? acc.maxLtv.value : Number(curr.maxLtv),
            protocol: accMaxLtvHigherThanCurr ? acc.maxLtv.protocol : curr.protocol,
            primaryToken: accMaxLtvHigherThanCurr ? acc.maxLtv.primaryToken : curr.primaryToken,
            secondaryToken: accMaxLtvHigherThanCurr
              ? acc.maxLtv.secondaryToken
              : curr.secondaryToken,
            network: accMaxLtvHigherThanCurr ? acc.maxLtv.network : curr.network,
          },
          fee: {
            value: accFeeLowerThanCurr ? acc.fee.value : Number(curr.fee),
            protocol: accFeeLowerThanCurr ? acc.fee.protocol : curr.protocol,
            primaryToken: accFeeLowerThanCurr ? acc.fee.primaryToken : curr.primaryToken,
            secondaryToken: accFeeLowerThanCurr ? acc.fee.secondaryToken : curr.secondaryToken,
            network: accFeeLowerThanCurr ? acc.maxLtv.network : curr.network,
          },
          liquidity: {
            value: accLiquidityHigherThanCurr ? acc.liquidity.value : Number(curr.liquidity),
            protocol: accLiquidityHigherThanCurr ? acc.liquidity.protocol : curr.protocol,
            primaryToken: accLiquidityHigherThanCurr
              ? acc.liquidity.primaryToken
              : curr.primaryToken,
            secondaryToken: accLiquidityHigherThanCurr
              ? acc.liquidity.secondaryToken
              : curr.secondaryToken,
            network: accLiquidityHigherThanCurr ? acc.maxLtv.network : curr.network,
          },
        }
      },
      {
        maxLtv: getProductBorrowInitNavItem(0),
        fee: getProductBorrowInitNavItem(1),
        liquidity: getProductBorrowInitNavItem(0),
      },
    )
}
