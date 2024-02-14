import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
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
  const ETHUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['ETH', 'USDC'])
  const SDAIUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['SDAI', 'USDC'])
  const TBTCWBTCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['TBTC', 'WBTC'])
  const USDCETHAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['USDC', 'ETH'])
  const USDCWBTCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['USDC', 'WBTC'])
  const WBTCDAIAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WBTC', 'DAI'])
  const WBTCUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WBTC', 'USDC'])
  const WSTETHDAIAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WSTETH', 'DAI'])
  const WSTETHUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WSTETH', 'USDC'])
  const YFIDAIAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['YFI', 'DAI'])

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
    pills: [],
  })
  const promoCardETHUSDCAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'ETH',
    debtToken: 'USDC',
    product: ETHUSDCAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardSDAIUSDCAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'SDAI',
    debtToken: 'USDC',
    product: SDAIUSDCAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardTBTCWBTCAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'TBTC',
    debtToken: 'WBTC',
    product: TBTCWBTCAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
    pills: [],
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
  const promoCardYFIDAIAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'YFI',
    debtToken: 'DAI',
    product: YFIDAIAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })

  const promoCardCBETHETHAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'CBETH',
    debtToken: 'ETH',
    product: CBETHETHAjnaBorrowishProduct,
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
  const promoCardWSTETHUSDCAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'USDC',
    product: WSTETHUSDCAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('WSTETH')],
    ...commonPromoCardPayload,
  })
  const promoCardYFIDAIAjnaMultiply = parseMultiplyPromoCard({
    collateralToken: 'YFI',
    debtToken: 'DAI',
    product: YFIDAIAjnaBorrowishProduct,
    pills: [getAjnaTokensPill(), getLongTokenPill('YFI')],
    ...commonPromoCardPayload,
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
    promoCardSDAIUSDCAjnaBorrow,
    promoCardTBTCWBTCAjnaBorrow,
    promoCardUSDCETHAjnaBorrow,
    promoCardUSDCWBTCAjnaBorrow,
    promoCardWBTCUSDCAjnaBorrow,
    promoCardYFIDAIAjnaBorrow,
    promoCardCBETHETHAjnaMultiply,
    promoCardUSDCETHAjnaMultiply,
    promoCardUSDCWBTCAjnaMultiply,
    promoCardWBTCDAIAjnaMultiply,
    promoCardWBTCUSDCAjnaMultiply,
    promoCardWSTETHDAIAjnaMultiply,
    promoCardWSTETHUSDCAjnaMultiply,
    promoCardYFIDAIAjnaMultiply,
    promoCardETHUSDCAjnaEarn,
    promoCardUSDCETHAjnaEarn,
    promoCardUSDCWBTCAjnaEarn,
    promoCardWBTCDAIAjnaEarn,
    promoCardWBTCUSDCAjnaEarn,
    promoCardWSTETHDAIAjnaEarn,
  }
}
