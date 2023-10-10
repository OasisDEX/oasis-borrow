import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { findByIlk } from 'handlers/product-hub/helpers'
import {
  getAutomationEnabledPill,
  getEarnStakingRewardsPill,
  getHighestAvailableLtvPill,
  getHighestMultiplePill,
  getLongTokenPill,
  getLowestBorrowingCostPill,
  parseBorrowPromoCard,
  parseDsrPromoCard,
  parseMultiplyPromoCard,
} from 'handlers/product-hub/promo-cards/parsers'
import { LendingProtocol } from 'lendingProtocols'

export function getMakerPromoCards(table: ProductHubItem[]) {
  const makerProducts = table.filter((product) => product.protocol === LendingProtocol.Maker)
  const makerBorrowishProducts = makerProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Borrow),
  )

  const ETHBMakerProduct = findByIlk(makerBorrowishProducts, 'ETH-B')
  const ETHCMakerProduct = findByIlk(makerBorrowishProducts, 'ETH-C')
  const RETHAMakerProduct = findByIlk(makerBorrowishProducts, 'RETH-A')
  const WBTCBMakerProduct = findByIlk(makerBorrowishProducts, 'WBTC-B')
  const WBTCCMakerProduct = findByIlk(makerBorrowishProducts, 'WBTC-C')
  const WSTETHAMakerProduct = findByIlk(makerBorrowishProducts, 'WSTETH-A')
  const WSTETHBMakerProduct = findByIlk(makerBorrowishProducts, 'WSTETH-B')

  const DSRProduct = makerProducts.find(
    ({ primaryToken, secondaryToken }) => primaryToken === 'DAI' && secondaryToken === 'DAI',
  )

  const promoCardETHCMakerBorrow = parseBorrowPromoCard({
    collateralToken: 'ETH',
    debtToken: 'DAI',
    pills: [getLowestBorrowingCostPill(), getAutomationEnabledPill()],
    product: ETHCMakerProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardRETHAMakerBorrow = parseBorrowPromoCard({
    collateralToken: 'RETH',
    debtToken: 'DAI',
    pills: [getEarnStakingRewardsPill(), getAutomationEnabledPill()],
    product: RETHAMakerProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWBTCBMakerBorrow = parseBorrowPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'DAI',
    pills: [getHighestAvailableLtvPill(), getAutomationEnabledPill()],
    product: WBTCBMakerProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWBTCCMakerBorrow = parseBorrowPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'DAI',
    pills: [getLowestBorrowingCostPill(), getAutomationEnabledPill()],
    product: WBTCCMakerProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWSTETHBMakerBorrow = parseBorrowPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'DAI',
    pills: [getEarnStakingRewardsPill(), getAutomationEnabledPill()],
    product: WSTETHBMakerProduct,
    protocol: LendingProtocol.Maker,
  })

  const promoCardETHBMakerMultiply = parseMultiplyPromoCard({
    collateralToken: 'ETH',
    debtToken: 'DAI',
    pills: [getLongTokenPill('ETH'), getAutomationEnabledPill()],
    product: ETHBMakerProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWBTCBMakerMultiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'DAI',
    pills: [getHighestMultiplePill(), getAutomationEnabledPill()],
    product: WBTCBMakerProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWSTETHAMakerMultiply = parseMultiplyPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'DAI',
    pills: [getEarnStakingRewardsPill(), getAutomationEnabledPill()],
    product: WSTETHAMakerProduct,
    protocol: LendingProtocol.Maker,
  })

  const promoCardDsrMakerEarn = parseDsrPromoCard(DSRProduct)

  return {
    promoCardETHCMakerBorrow,
    promoCardRETHAMakerBorrow,
    promoCardWBTCBMakerBorrow,
    promoCardWBTCCMakerBorrow,
    promoCardWSTETHBMakerBorrow,
    promoCardETHBMakerMultiply,
    promoCardWBTCBMakerMultiply,
    promoCardWSTETHAMakerMultiply,
    promoCardDsrMakerEarn,
  }
}
