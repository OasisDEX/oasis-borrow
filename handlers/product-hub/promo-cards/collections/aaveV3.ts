import { NetworkNames } from 'blockchain/networks'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { findByTokenPair } from 'handlers/product-hub/helpers'
import {
  getEarnStakingRewardsPill,
  getEnterWithToken,
  getHighestMultiplePill,
  getLongTokenPill,
  parseEarnYieldLoopPromoCard,
  parseMultiplyPromoCard,
} from 'handlers/product-hub/promo-cards/parsers'
import { LendingProtocol } from 'lendingProtocols'

export function getAaveV3PromoCards(table: ProductHubItem[]) {
  const aaveV3EthereumProducts = table.filter(
    ({ network, protocol }) =>
      protocol === LendingProtocol.AaveV3 && network === NetworkNames.ethereumMainnet,
  )
  const aaveV3EthereumMultiplyProducts = aaveV3EthereumProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Multiply),
  )
  const aaveV3EthereumEarnProducts = aaveV3EthereumProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )

  const ETHUSDCAaveV3EthereumMultiplyProduct = findByTokenPair(aaveV3EthereumMultiplyProducts, [
    'ETH',
    'USDC',
  ])
  const RETHUSDCAaveV3EthereumMultiplyProduct = findByTokenPair(aaveV3EthereumMultiplyProducts, [
    'RETH',
    'USDC',
  ])
  const WBTCUSDCAaveV3EthereumMultiplyProduct = findByTokenPair(aaveV3EthereumMultiplyProducts, [
    'WBTC',
    'USDC',
  ])
  const WSTETHUSDCAaveV3EthereumMultiplyProduct = findByTokenPair(aaveV3EthereumMultiplyProducts, [
    'WSTETH',
    'USDC',
  ])

  const WSTETHETHAaveV3EthereumEarnProduct = findByTokenPair(aaveV3EthereumEarnProducts, [
    'WSTETH',
    'ETH',
  ])

  const promoCardETHUSDCAaveV3Multiply = parseMultiplyPromoCard({
    collateralToken: 'ETH',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('ETH')],
    product: ETHUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })
  const promoCardRETHUSDCAaveV3Multiply = parseMultiplyPromoCard({
    collateralToken: 'RETH',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getEarnStakingRewardsPill()],
    product: RETHUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })
  const promoCardWBTCUSDCAaveV3Multiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('WBTC')],
    product: WBTCUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })
  const promoCardWSTETHUSDCAaveV3Multiply = parseMultiplyPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('WSTETH')],
    product: WSTETHUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })

  const promoCardWSTETHUSDCAaveV3Earn = parseEarnYieldLoopPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'ETH',
    pills: [getEnterWithToken('ETH')],
    product: WSTETHETHAaveV3EthereumEarnProduct,
    protocol: LendingProtocol.AaveV3,
    withYieldExposurePillPill: true,
  })

  return {
    promoCardETHUSDCAaveV3Multiply,
    promoCardRETHUSDCAaveV3Multiply,
    promoCardWBTCUSDCAaveV3Multiply,
    promoCardWSTETHUSDCAaveV3Multiply,
    promoCardWSTETHUSDCAaveV3Earn,
  }
}
