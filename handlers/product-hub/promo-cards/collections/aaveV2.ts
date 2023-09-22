import { NetworkNames } from 'blockchain/networks'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { findByTokenPair } from 'handlers/product-hub/helpers'
import {
  getEnterWithToken,
  parseEarnYieldLoopPromoCard,
} from 'handlers/product-hub/promo-cards/parsers'
import { LendingProtocol } from 'lendingProtocols'

export function getAaveV2PromoCards(table: ProductHubItem[]) {
  const aaveV2EthereumProducts = table.filter(
    ({ network, protocol }) =>
      protocol === LendingProtocol.AaveV2 && network === NetworkNames.ethereumMainnet,
  )
  const aaveV2EthereumEarnProducts = aaveV2EthereumProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )

  const STETHETHAaveV2EthereumEarnProduct = findByTokenPair(aaveV2EthereumEarnProducts, [
    'STETH',
    'ETH',
  ])

  const promoCardSTETHUSDCAaveV2Earn = parseEarnYieldLoopPromoCard({
    collateralToken: 'STETH',
    debtToken: 'ETH',
    pills: [getEnterWithToken('ETH')],
    product: STETHETHAaveV2EthereumEarnProduct,
    protocol: LendingProtocol.AaveV2,
    withYieldExposurePillPill: true,
  })

  return {
    promoCardSTETHUSDCAaveV2Earn,
  }
}
