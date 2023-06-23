import { NetworkNames } from 'blockchain/networks'
import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import {
  automationEnabledPill,
  earnStakingRewardsPill,
  findByIlk,
  findByTokenPair,
  highestAvailableLtvPill,
  highestMultiplePill,
  lowestBorrowingCostPill,
  parseAaveV3MultiplyPromoCard,
  parseMakerBorrowPromoCard,
} from 'handlers/product-hub/helpers'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const makerProducts = table.filter((product) => product.protocol === LendingProtocol.Maker)
  const aaveV3EthereumProducts = table.filter(
    ({ network, protocol }) =>
      protocol === LendingProtocol.AaveV3 && network === NetworkNames.ethereumMainnet,
  )
  const makerBorrowishProducts = makerProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Borrow),
  )
  const aaveV3EthereumMultiplyProducts = aaveV3EthereumProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Multiply),
  )

  const ETHCProduct = findByIlk(makerBorrowishProducts, 'ETH-C')
  const WSTETHAProduct = findByIlk(makerBorrowishProducts, 'WSTETH-A')
  const WSTETHBProduct = findByIlk(makerBorrowishProducts, 'WSTETH-B')
  const RETHAProduct = findByIlk(makerBorrowishProducts, 'RETH-A')
  const WBTCBProduct = findByIlk(makerBorrowishProducts, 'WBTC-B')
  const WBTCCProduct = findByIlk(makerBorrowishProducts, 'WBTC-C')

  const ETHUSDCAaveV3BorrowishProduct = findByTokenPair(aaveV3EthereumMultiplyProducts, [
    'ETH',
    'USDC',
  ])

  const promoCardLearnAboutBorrow = {
    icon: 'selectBorrow',
    title: { key: 'product-hub.promo-cards.get-liquidity-from-your-assets' },
    description: { key: 'product-hub.promo-cards.learn-how-to-use-borrow-and-get-liquidity' },
    link: { href: EXTERNAL_LINKS.KB.WHAT_IS_BORROW, label: { key: 'Learn more' } },
  }

  const promoCardETHCBorrow = {
    ...parseMakerBorrowPromoCard('ETH', 'DAI', ETHCProduct),
    pills: [lowestBorrowingCostPill, automationEnabledPill],
  }
  const promoCardWSTETHBBorrow = {
    ...parseMakerBorrowPromoCard('WSTETH', 'DAI', WSTETHBProduct),
    pills: [earnStakingRewardsPill, automationEnabledPill],
  }
  const promoCardRETHABorrow = {
    ...parseMakerBorrowPromoCard('RETH', 'DAI', RETHAProduct),
    pills: [earnStakingRewardsPill, automationEnabledPill],
  }
  const promoCardWBTCBBorrow = {
    ...parseMakerBorrowPromoCard('WBTC', 'DAI', WBTCBProduct),
    pills: [highestAvailableLtvPill, automationEnabledPill],
  }
  const promoCardWBTCCBorrow = {
    ...parseMakerBorrowPromoCard('WBTC', 'DAI', WBTCCProduct),
    pills: [lowestBorrowingCostPill, automationEnabledPill],
  }
  const promoCardWSTETHABorrow = {
    ...parseMakerBorrowPromoCard('WSTETH', 'DAI', WSTETHAProduct),
    pills: [earnStakingRewardsPill, automationEnabledPill],
  }

  const promoCardETHUSDCAaveV3Multiply = {
    ...parseAaveV3MultiplyPromoCard('ETH', 'USDC', ETHUSDCAaveV3BorrowishProduct),
    pills: [
      highestMultiplePill,
      {
        label: { key: 'product-hub.promo-cards.long-token', props: { token: 'ETH' } },
      },
    ],
  }

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHCBorrow, promoCardWSTETHBBorrow, promoCardWBTCCBorrow],
      tokens: {
        ETH: [promoCardETHCBorrow, promoCardWSTETHBBorrow, promoCardRETHABorrow],
        WBTC: [promoCardWBTCCBorrow, promoCardWBTCBBorrow, promoCardLearnAboutBorrow],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [],
      tokens: {
        ETH: [promoCardETHUSDCAaveV3Multiply, promoCardWSTETHABorrow],
      },
    },
    [ProductHubProductType.Earn]: {
      default: [],
      tokens: {},
    },
  }
}
