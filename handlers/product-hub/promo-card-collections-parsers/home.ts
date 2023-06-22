import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import { findByIlk } from 'handlers/product-hub/helpers'
import {
  automationEnabledPill,
  earnStakingRewardsPill,
  highestAvailableLtvPill,
  lowestBorrowingCostPill,
  parseMakerBorrowPromoCard,
} from 'handlers/product-hub/helpers/parseMakerPromoCards'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const makerProducts = table.filter((product) => product.protocol === LendingProtocol.Maker)
  const borrowishProducts = makerProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Borrow),
  )

  const ETHCProduct = findByIlk(borrowishProducts, 'ETH-C')
  const WSTETHBProduct = findByIlk(borrowishProducts, 'WSTETH-B')
  const RETHAProduct = findByIlk(borrowishProducts, 'RETH-A')
  const WBTCBProduct = findByIlk(borrowishProducts, 'WBTC-B')
  const WBTCCProduct = findByIlk(borrowishProducts, 'WBTC-C')

  const promoCardLearnAboutBorrow = {
    icon: 'selectBorrow',
    title: { key: 'product-hub.promo-cards.get-liquidity-from-your-assets' },
    description: { key: 'product-hub.promo-cards.learn-how-to-use-borrow-and-get-liquidity' },
    link: { href: EXTERNAL_LINKS.KB.WHAT_IS_BORROW, label: { key: 'Learn more' } },
  }

  const promoCardETHC = {
    ...parseMakerBorrowPromoCard('ETH', 'DAI', ETHCProduct),
    pills: [lowestBorrowingCostPill, automationEnabledPill],
  }
  const promoCardWSTETHB = {
    ...parseMakerBorrowPromoCard('WSTETH', 'DAI', WSTETHBProduct),
    pills: [earnStakingRewardsPill, automationEnabledPill],
  }
  const promoCardRETHA = {
    ...parseMakerBorrowPromoCard('RETH', 'DAI', RETHAProduct),
    pills: [earnStakingRewardsPill, automationEnabledPill],
  }
  const promoCardWBTCB = {
    ...parseMakerBorrowPromoCard('WBTC', 'DAI', WBTCBProduct),
    pills: [highestAvailableLtvPill, automationEnabledPill],
  }
  const promoCardWBTCC = {
    ...parseMakerBorrowPromoCard('WBTC', 'DAI', WBTCCProduct),
    pills: [lowestBorrowingCostPill, automationEnabledPill],
  }

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHC, promoCardWSTETHB, promoCardWBTCC],
      tokens: {
        ETH: [promoCardETHC, promoCardWSTETHB, promoCardRETHA],
        WBTC: [promoCardWBTCC, promoCardWBTCB, promoCardLearnAboutBorrow],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [],
      tokens: {},
    },
    [ProductHubProductType.Earn]: {
      default: [],
      tokens: {},
    },
  }
}
