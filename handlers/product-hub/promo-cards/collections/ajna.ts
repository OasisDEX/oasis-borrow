import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { findByTokenPair } from 'handlers/product-hub/helpers'
import {
  getActiveManagementPill,
  getAjnaTokensPill,
  getLongTokenPill,
  getShortTokenPill,
  parseBorrowPromoCard,
  parseEarnLiquidityProvisionPromoCard,
  parseMultiplyPromoCard,
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

  const CBETHETHAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['CBETH', 'ETH'])
  const ETHDAIAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['ETH', 'DAI'])
  const ETHGHOAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['ETH', 'GHO'])
  const ETHUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['ETH', 'USDC'])
  const GHODAIAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['GHO', 'DAI'])
  const USDCETHAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['USDC', 'ETH'])
  const USDCWBTCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['USDC', 'WBTC'])
  const WBTCDAIAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WBTC', 'DAI'])
  const WBTCGHOAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WBTC', 'GHO'])
  const WBTCUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WBTC', 'USDC'])
  const WLDUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WLD', 'USDC'])
  const WSTETHDAIAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WSTETH', 'DAI'])
  const WSTETHGHOAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WSTETH', 'GHO'])
  const WSTETHUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WSTETH', 'USDC'])

  const CBETHGHOAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['GHO', 'CBETH'])
  const ETHUSDCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['USDC', 'ETH'])
  const USDCETHAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['ETH', 'USDC'])
  const USDCWBTCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['WBTC', 'USDC'])
  const USDCWLDAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['WLD', 'USDC'])
  const WBTCDAICAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['DAI', 'WBTC'])
  const WBTCGHOCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['GHO', 'WBTC'])
  const WBTCUSDCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['USDC', 'WBTC'])
  const WSTETHDAIAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['DAI', 'WSTETH'])
  const WSTETHGHOAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['GHO', 'WSTETH'])

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
  const promoCardGHODAIAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'GHO',
    debtToken: 'DAI',
    product: GHODAIAjnaBorrowishProduct,
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
  const promoCardWBTCGHOAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'GHO',
    product: WBTCGHOAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardWLDUSDCAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'WLD',
    debtToken: 'USDC',
    product: WLDUSDCAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardWSTETHGHOAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'GHO',
    product: WSTETHGHOAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })

  const promoCardCBETHETHAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'CBETH',
    debtToken: 'ETH',
    product: CBETHETHAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('ETH')],
    ...commonPromoCardPayload,
  })
  const promoCardETHGHOAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'ETH',
    debtToken: 'GHO',
    product: ETHGHOAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('ETH')],
    ...commonPromoCardPayload,
  })
  const promoCardUSDCETHAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'USDC',
    debtToken: 'ETH',
    product: USDCETHAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getShortTokenPill('ETH')],
    ...commonPromoCardPayload,
  })
  const promoCardUSDCWBTCAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'USDC',
    debtToken: 'WBTC',
    product: USDCWBTCAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getShortTokenPill('WBTC')],
    ...commonPromoCardPayload,
  })
  const promoCardWBTCDAIAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'DAI',
    product: WBTCDAIAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('WBTC')],
    ...commonPromoCardPayload,
  })
  const promoCardWBTCGHOAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'GHO',
    product: WBTCGHOAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('WBTC')],
    ...commonPromoCardPayload,
  })
  const promoCardWBTCUSDCAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    product: WBTCUSDCAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('WBTC')],
    ...commonPromoCardPayload,
  })
  const promoCardWSTETHDAIAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'DAI',
    product: WSTETHDAIAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('WSTETH')],
    ...commonPromoCardPayload,
  })
  const promoCardWSTETHGHOAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'GHO',
    product: WSTETHGHOAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('WSTETH')],
    ...commonPromoCardPayload,
  })
  const promoCardWSTETHUSDCAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'USDC',
    product: WSTETHUSDCAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('WSTETH')],
    ...commonPromoCardPayload,
  })

  const promoCardCBETHGHOCAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'CBETH',
    debtToken: 'GHO',
    product: CBETHGHOAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
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
  const promoCardUSDCWLDAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'USDC',
    debtToken: 'WLD',
    product: USDCWLDAjnaEarnProduct,
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
  const promoCardWBTCGHOAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'GHO',
    product: WBTCGHOCAjnaEarnProduct,
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
  const promoCardWSTETHGHOAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'GHO',
    product: WSTETHGHOAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })

  return {
    promoCardETHDAIAjnaBorrow,
    promoCardETHUSDCAjnaBorrow,
    promoCardGHODAIAjnaBorrow,
    promoCardUSDCETHAjnaBorrow,
    promoCardUSDCWBTCAjnaBorrow,
    promoCardWBTCGHOAjnaBorrow,
    promoCardWBTCUSDCAjnaBorrow,
    promoCardWLDUSDCAjnaBorrow,
    promoCardWSTETHGHOAjnaBorrow,
    promoCardCBETHETHAjnaMultiply,
    promoCardETHGHOAjnaMultiply,
    promoCardUSDCETHAjnaMultiply,
    promoCardUSDCWBTCAjnaMultiply,
    promoCardWBTCDAIAjnaMultiply,
    promoCardWBTCGHOAjnaMultiply,
    promoCardWBTCUSDCAjnaMultiply,
    promoCardWSTETHDAIAjnaMultiply,
    promoCardWSTETHGHOAjnaMultiply,
    promoCardWSTETHUSDCAjnaMultiply,
    promoCardCBETHGHOCAjnaEarn,
    promoCardETHUSDCAjnaEarn,
    promoCardUSDCETHAjnaEarn,
    promoCardUSDCWBTCAjnaEarn,
    promoCardUSDCWLDAjnaEarn,
    promoCardWBTCDAIAjnaEarn,
    promoCardWBTCGHOAjnaEarn,
    promoCardWBTCUSDCAjnaEarn,
    promoCardWSTETHDAIAjnaEarn,
    promoCardWSTETHGHOAjnaEarn,
  }
}
