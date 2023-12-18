import { NetworkNames } from 'blockchain/networks'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
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
  const aaveV3OptimismProducts = table.filter(
    ({ network, protocol }) =>
      protocol === LendingProtocol.AaveV3 && network === NetworkNames.optimismMainnet,
  )
  const aaveV3ArbitrumProducts = table.filter(
    ({ network, protocol }) =>
      protocol === LendingProtocol.AaveV3 && network === NetworkNames.arbitrumMainnet,
  )
  const aaveV3EthereumMultiplyProducts = aaveV3EthereumProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Multiply),
  )
  const aaveV3EthereumEarnProducts = aaveV3EthereumProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )
  const aaveV3OptimismMultiplyProducts = aaveV3OptimismProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Multiply),
  )
  const aaveV3ArbitrumMultiplyProducts = aaveV3ArbitrumProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Multiply),
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
  const ETHUSDCAaveV3OptimismMultiplyProduct = findByTokenPair(aaveV3OptimismMultiplyProducts, [
    'ETH',
    'USDC',
  ])
  const WBTCUSDCAaveV3OptimismMultiplyProduct = findByTokenPair(aaveV3OptimismMultiplyProducts, [
    'WBTC',
    'USDC',
  ])
  const WBTCUSDCAaveV3ArbitrumMultiplyProduct = findByTokenPair(aaveV3ArbitrumMultiplyProducts, [
    'WBTC',
    'USDC',
  ])

  const WSTETHETHAaveV3EthereumEarnProduct = findByTokenPair(aaveV3EthereumEarnProducts, [
    'WSTETH',
    'ETH',
  ])

  const promoCardETHUSDCAaveV3EthereumMultiply = parseMultiplyPromoCard({
    collateralToken: 'ETH',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('ETH')],
    product: ETHUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })
  const promoCardRETHUSDCAaveV3EthereumMultiply = parseMultiplyPromoCard({
    collateralToken: 'RETH',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getEarnStakingRewardsPill()],
    product: RETHUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })
  const promoCardWBTCUSDCAaveV3EthereumMultiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('WBTC')],
    product: WBTCUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })
  const promoCardWSTETHUSDCAaveV3EthereumMultiply = parseMultiplyPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('WSTETH')],
    product: WSTETHUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })
  const promoCardETHUSDCAaveV3OptimismMultiply = parseMultiplyPromoCard({
    collateralToken: 'ETH',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('ETH')],
    product: ETHUSDCAaveV3OptimismMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
    network: NetworkNames.optimismMainnet,
  })
  const promoCardWBTCUSDCAaveV3OptimismMultiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('WBTC')],
    product: WBTCUSDCAaveV3OptimismMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
    network: NetworkNames.optimismMainnet,
  })
  const promoCardWBTCUSDCAaveV3ArbitrumMultiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('WBTC')],
    product: WBTCUSDCAaveV3ArbitrumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
    network: NetworkNames.arbitrumMainnet,
  })

  const promoCardWSTETHUSDCAaveV3EthereumEarn = parseEarnYieldLoopPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'ETH',
    pills: [getEnterWithToken('ETH')],
    product: WSTETHETHAaveV3EthereumEarnProduct,
    protocol: LendingProtocol.AaveV3,
    withYieldExposurePillPill: true,
  })

  return {
    promoCardETHUSDCAaveV3EthereumMultiply,
    promoCardRETHUSDCAaveV3EthereumMultiply,
    promoCardWBTCUSDCAaveV3EthereumMultiply,
    promoCardWSTETHUSDCAaveV3EthereumMultiply,
    promoCardETHUSDCAaveV3OptimismMultiply,
    promoCardWSTETHUSDCAaveV3EthereumEarn,
    promoCardWBTCUSDCAaveV3OptimismMultiply,
    promoCardWBTCUSDCAaveV3ArbitrumMultiply,
  }
}
