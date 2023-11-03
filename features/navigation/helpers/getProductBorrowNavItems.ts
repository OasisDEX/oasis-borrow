import { NetworkNames } from 'blockchain/networks'
import { getActionUrl } from 'features/productHub/helpers'
import type { ProductHubItem, ProductHubSupportedNetworks } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

type ProductBorrowNavItem = {
  value: number
  protocol: LendingProtocol
  primaryToken: string
  secondaryToken: string
  network: ProductHubSupportedNetworks
  url: string
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
  protocol: LendingProtocol.AaveV3,
  network: NetworkNames.ethereumMainnet,
  url: '',
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
        const currLiquidityHigherThanAcc =
          Number(curr.liquidity) > acc.liquidity.value && curr.hasRewards

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
            url: accMaxLtvHigherThanCurr
              ? acc.maxLtv.url
              : getActionUrl({ ...curr, product: [ProductHubProductType.Borrow] }),
          },
          fee: {
            value: accFeeLowerThanCurr ? acc.fee.value : Number(curr.fee),
            protocol: accFeeLowerThanCurr ? acc.fee.protocol : curr.protocol,
            primaryToken: accFeeLowerThanCurr ? acc.fee.primaryToken : curr.primaryToken,
            secondaryToken: accFeeLowerThanCurr ? acc.fee.secondaryToken : curr.secondaryToken,
            network: accFeeLowerThanCurr ? acc.fee.network : curr.network,
            url: accFeeLowerThanCurr
              ? acc.fee.url
              : getActionUrl({ ...curr, product: [ProductHubProductType.Borrow] }),
          },
          liquidity: {
            value: currLiquidityHigherThanAcc ? Number(curr.liquidity) : acc.liquidity.value,
            protocol: currLiquidityHigherThanAcc ? curr.protocol : acc.liquidity.protocol,
            primaryToken: currLiquidityHigherThanAcc
              ? curr.primaryToken
              : acc.liquidity.primaryToken,
            secondaryToken: currLiquidityHigherThanAcc
              ? curr.secondaryToken
              : acc.liquidity.secondaryToken,
            network: currLiquidityHigherThanAcc ? acc.liquidity.network : curr.network,
            url: currLiquidityHigherThanAcc
              ? getActionUrl({ ...curr, product: [ProductHubProductType.Borrow] })
              : acc.liquidity.url,
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
