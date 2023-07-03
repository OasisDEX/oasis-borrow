import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { findByTokenPair } from 'handlers/product-hub/helpers'
import {
  getActiveManagementPill,
  getAjnaTokensPill,
  parseBorrowPromoCard,
  parseEarnLiquidityProvisionPromoCard,
} from 'handlers/product-hub/promo-cards/parsers'
import { LendingProtocol } from 'lendingProtocols'

const commonPromoCardPayload = {
  protocol: LendingProtocol.Ajna,
}
const commonBorrowPromoCardPayload = {
  ...commonPromoCardPayload,
  pills: [getAjnaTokensPill()],
  withMaxLtvPill: true,
}
const commonEarnPromoCardPayload = {
  ...commonPromoCardPayload,
  pills: [getActiveManagementPill(), getAjnaTokensPill()],
}

export function getAjnaPromoCards(table: ProductHubItem[]) {
  const ajnaProducts = table.filter(({ protocol }) => protocol === LendingProtocol.Ajna)
  const ajnaBorrowishProducts = ajnaProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Borrow),
  )
  const ajnaEarnProducts = ajnaProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )

  const ETHDAIAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['ETH', 'DAI'])
  const ETHUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['ETH', 'USDC'])
  const USDCETHAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['USDC', 'ETH'])
  const USDCWBTCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['USDC', 'WBTC'])
  const WBTCUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WBTC', 'USDC'])

  const ETHUSDCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['USDC', 'ETH'])
  const USDCETHAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['ETH', 'USDC'])
  const USDCWBTCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['WBTC', 'USDC'])
  const WBTCDAICAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['DAI', 'WBTC'])
  const WBTCUSDCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['USDC', 'WBTC'])
  const WSTETHDAIAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['DAI', 'WSTETH'])

  const promoCardETHDAIAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'ETH',
    debtToken: 'DAI',
    product: ETHDAIAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardETHUSDCAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'ETH',
    debtToken: 'USDC',
    product: ETHUSDCAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardUSDCETHAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'USDC',
    debtToken: 'ETH',
    product: USDCETHAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardUSDCWBTCAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'USDC',
    debtToken: 'WBTC',
    product: USDCWBTCAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardWBTCUSDCAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    product: WBTCUSDCAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })

  const promoCardETHUSDCAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'ETH',
    debtToken: 'USDC',
    product: ETHUSDCAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })
  const promoCardUSDCETHAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'USDC',
    debtToken: 'ETH',
    product: USDCETHAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })
  const promoCardUSDCWBTCAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'USDC',
    debtToken: 'WBTC',
    product: USDCWBTCAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })
  const promoCardWBTCDAIAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'DAI',
    product: WBTCDAICAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })
  const promoCardWBTCUSDCAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    product: WBTCUSDCAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })
  const promoCardWSTETHDAIAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'DAI',
    product: WSTETHDAIAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })

  return {
    promoCardETHDAIAjnaBorrow,
    promoCardETHUSDCAjnaBorrow,
    promoCardUSDCETHAjnaBorrow,
    promoCardUSDCWBTCAjnaBorrow,
    promoCardWBTCUSDCAjnaBorrow,
    promoCardETHUSDCAjnaEarn,
    promoCardUSDCETHAjnaEarn,
    promoCardUSDCWBTCAjnaEarn,
    promoCardWBTCDAIAjnaEarn,
    promoCardWBTCUSDCAjnaEarn,
    promoCardWSTETHDAIAjnaEarn,
  }
}
