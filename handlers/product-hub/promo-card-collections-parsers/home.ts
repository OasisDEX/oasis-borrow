import { NetworkNames } from 'blockchain/networks'
import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import {
  findByIlk,
  findByTokenPair,
  getAutomationEnabledPill,
  getEarnStakingRewardsPill,
  getHighestAvailableLtvPill,
  getHighestMultiplePill,
  getLongTokenPill,
  getLowestBorrowingCostPill,
  parseDsrPromoCard,
  parseMakerBorrowPromoCard,
  parseMultiplyPromoCard,
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

  const ETHBProduct = findByIlk(makerBorrowishProducts, 'ETH-B')
  const ETHCProduct = findByIlk(makerBorrowishProducts, 'ETH-C')
  const WSTETHAProduct = findByIlk(makerBorrowishProducts, 'WSTETH-A')
  const WSTETHBProduct = findByIlk(makerBorrowishProducts, 'WSTETH-B')
  const RETHAProduct = findByIlk(makerBorrowishProducts, 'RETH-A')
  const WBTCBProduct = findByIlk(makerBorrowishProducts, 'WBTC-B')
  const WBTCCProduct = findByIlk(makerBorrowishProducts, 'WBTC-C')
  const DSRProduct = makerProducts.find(
    ({ primaryToken, secondaryToken }) => primaryToken === 'DAI' && secondaryToken === 'DAI',
  )

  const ETHUSDCAaveV3EthereumMultiplyProduct = findByTokenPair(aaveV3EthereumMultiplyProducts, [
    'ETH',
    'USDC',
  ])
  const RETHUSDCAaveV3EthereumMultiplyProduct = findByTokenPair(aaveV3EthereumMultiplyProducts, [
    'RETH',
    'USDC',
  ])
  const WSTETHUSDCAaveV3EthereumMultiplyProduct = findByTokenPair(aaveV3EthereumMultiplyProducts, [
    'WSTETH',
    'USDC',
  ])
  const WBTCUSDCAaveV3EthereumMultiplyProduct = findByTokenPair(aaveV3EthereumMultiplyProducts, [
    'WBTC',
    'USDC',
  ])

  const promoCardLearnAboutBorrow = {
    icon: 'selectBorrow',
    title: { key: 'product-hub.promo-cards.get-liquidity-from-your-assets' },
    description: { key: 'product-hub.promo-cards.learn-how-to-use-borrow-and-get-liquidity' },
    link: { href: EXTERNAL_LINKS.KB.WHAT_IS_BORROW, label: { key: 'Learn more' } },
  }
  const promoCardLearnAboutMultiply = {
    icon: 'selectMultiply',
    title: { key: 'product-hub.promo-cards.get-to-know-multiply' },
    description: {
      key: 'product-hub.promo-cards.learn-how-to-use-multiply-to-optimize-your-position',
    },
    link: { href: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY, label: { key: 'Learn more' } },
  }

  const promoCardETHCBorrow = {
    ...parseMakerBorrowPromoCard('ETH', 'DAI', ETHCProduct),
    pills: [getLowestBorrowingCostPill(), getAutomationEnabledPill()],
  }
  const promoCardWSTETHBBorrow = {
    ...parseMakerBorrowPromoCard('WSTETH', 'DAI', WSTETHBProduct),
    pills: [getEarnStakingRewardsPill(), getAutomationEnabledPill()],
  }
  const promoCardRETHABorrow = {
    ...parseMakerBorrowPromoCard('RETH', 'DAI', RETHAProduct),
    pills: [getEarnStakingRewardsPill(), getAutomationEnabledPill()],
  }
  const promoCardWBTCBBorrow = {
    ...parseMakerBorrowPromoCard('WBTC', 'DAI', WBTCBProduct),
    pills: [getHighestAvailableLtvPill(), getAutomationEnabledPill()],
  }
  const promoCardWBTCCBorrow = {
    ...parseMakerBorrowPromoCard('WBTC', 'DAI', WBTCCProduct),
    pills: [getLowestBorrowingCostPill(), getAutomationEnabledPill()],
  }
  const promoCardDsr = parseDsrPromoCard(DSRProduct)

  const promoCardETHBMultiply = parseMultiplyPromoCard({
    collateralToken: 'ETH',
    debtToken: 'DAI',
    pills: [getLongTokenPill('ETH'), getAutomationEnabledPill()],
    product: ETHBProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWSTETHAMultiply = parseMultiplyPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'DAI',
    pills: [getEarnStakingRewardsPill(), getAutomationEnabledPill()],
    product: WSTETHAProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWBTCBMultiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'DAI',
    pills: [getHighestMultiplePill(), getAutomationEnabledPill()],
    product: WBTCBProduct,
    protocol: LendingProtocol.Maker,
  })

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
  const promoCardWSTETHUSDCAaveV3Multiply = parseMultiplyPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('WSTETH')],
    product: WSTETHUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })
  const promoCardWBTCUSDCAaveV3Multiply = parseMultiplyPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    pills: [getHighestMultiplePill(), getLongTokenPill('WBTC')],
    product: WBTCUSDCAaveV3EthereumMultiplyProduct,
    protocol: LendingProtocol.AaveV3,
  })

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHCBorrow, promoCardWSTETHBBorrow, promoCardWBTCCBorrow],
      tokens: {
        ETH: [promoCardETHCBorrow, promoCardWSTETHBBorrow, promoCardRETHABorrow],
        WBTC: [promoCardWBTCCBorrow, promoCardWBTCBBorrow, promoCardLearnAboutBorrow],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [
        promoCardETHUSDCAaveV3Multiply,
        promoCardWBTCUSDCAaveV3Multiply,
        promoCardETHBMultiply,
      ],
      tokens: {
        ETH: [
          promoCardETHUSDCAaveV3Multiply,
          promoCardWSTETHAMultiply,
          promoCardRETHUSDCAaveV3Multiply,
        ],
        WBTC: [
          promoCardWBTCBMultiply,
          promoCardWBTCUSDCAaveV3Multiply,
          promoCardLearnAboutMultiply,
        ],
        USDC: [
          promoCardETHUSDCAaveV3Multiply,
          promoCardWSTETHUSDCAaveV3Multiply,
          promoCardWBTCUSDCAaveV3Multiply,
        ],
        DAI: [promoCardWSTETHAMultiply, promoCardETHBMultiply, promoCardWBTCBMultiply],
      },
    },
    [ProductHubProductType.Earn]: {
      default: [promoCardDsr],
      tokens: {},
    },
  }
}
