import { NetworkNames } from 'blockchain/networks'
import { PromoCardVariant } from 'components/PromoCard'
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
  getEnterWithToken,
  getHighestAvailableLtvPill,
  getHighestMultiplePill,
  getLongTokenPill,
  getLowestBorrowingCostPill,
  getUpToYieldExposurePill,
  parseBorrowPromoCard,
  parseDsrPromoCard,
  parseEarnYieldLoopPromoCard,
  parseMultiplyPromoCard,
} from 'handlers/product-hub/helpers'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const makerProducts = table.filter((product) => product.protocol === LendingProtocol.Maker)
  const aaveV2EthereumProducts = table.filter(
    ({ network, protocol }) =>
      protocol === LendingProtocol.AaveV2 && network === NetworkNames.ethereumMainnet,
  )
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
  const aaveV2EthereumEarnProducts = aaveV2EthereumProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )
  const aaveV3EthereumEarnProducts = aaveV3EthereumProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
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
  const WSTETHETHAaveV2EthereumEarnProduct = findByTokenPair(aaveV2EthereumEarnProducts, [
    'STETH',
    'ETH',
  ])
  const WSTETHETHAaveV3EthereumEarnProduct = findByTokenPair(aaveV3EthereumEarnProducts, [
    'WSTETH',
    'ETH',
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
  const promoCardEarnOnYourAssets = {
    icon: 'selectEarn',
    title: { key: 'product-hub.promo-cards.earn-on-your-assets' },
    description: { key: 'product-hub.promo-cards.lend-and-stake-to-earn' },
    link: { href: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY, label: { key: 'Learn more' } },
  }
  const promoCardFullySelfCustodial = {
    icon: 'promoCardStar',
    title: { key: 'product-hub.promo-cards.earn-fully-self-custodial' },
    description: { key: 'product-hub.promo-cards.you-always-stay-in-control' },
    link: {
      href: INTERNAL_LINKS.security,
      label: { key: 'product-hub.promo-cards.check-out-our-security' },
    },
  }

  const promoCardETHCBorrow = parseBorrowPromoCard({
    collateralToken: 'ETH',
    debtToken: 'DAI',
    pills: [getLowestBorrowingCostPill(), getAutomationEnabledPill()],
    product: ETHCProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWSTETHBBorrow = parseBorrowPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'DAI',
    pills: [getEarnStakingRewardsPill(), getAutomationEnabledPill()],
    product: WSTETHBProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardRETHABorrow = parseBorrowPromoCard({
    collateralToken: 'RETH',
    debtToken: 'DAI',
    pills: [getEarnStakingRewardsPill(), getAutomationEnabledPill()],
    product: RETHAProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWBTCBBorrow = parseBorrowPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'DAI',
    pills: [getHighestAvailableLtvPill(), getAutomationEnabledPill()],
    product: WBTCBProduct,
    protocol: LendingProtocol.Maker,
  })
  const promoCardWBTCCBorrow = parseBorrowPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'DAI',
    pills: [getLowestBorrowingCostPill(), getAutomationEnabledPill()],
    product: WBTCCProduct,
    protocol: LendingProtocol.Maker,
  })
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
  const promoCardWSTETHUSDCAaveV2Earn = parseEarnYieldLoopPromoCard({
    collateralToken: 'STETH',
    debtToken: 'ETH',
    pills: [
      ...(WSTETHETHAaveV2EthereumEarnProduct?.maxMultiply
        ? [
            {
              ...getUpToYieldExposurePill(
                `${parseFloat(WSTETHETHAaveV2EthereumEarnProduct.maxMultiply).toFixed(1)}x`,
              ),
            },
          ]
        : []),
      getEnterWithToken('ETH'),
    ],
    product: WSTETHETHAaveV2EthereumEarnProduct,
    protocol: LendingProtocol.AaveV2,
  })
  const promoCardWSTETHUSDCAaveV3Earn = parseEarnYieldLoopPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'ETH',
    pills: [
      ...(WSTETHETHAaveV3EthereumEarnProduct?.maxMultiply
        ? [
            {
              ...getUpToYieldExposurePill(
                `${parseFloat(WSTETHETHAaveV3EthereumEarnProduct.maxMultiply).toFixed(1)}x`,
              ),
              variant: 'positive' as PromoCardVariant,
            },
          ]
        : []),
      getEnterWithToken('ETH'),
    ],
    product: WSTETHETHAaveV3EthereumEarnProduct,
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
      default: [promoCardDsr, promoCardWSTETHUSDCAaveV3Earn, promoCardWSTETHUSDCAaveV2Earn],
      tokens: {
        ETH: [
          promoCardWSTETHUSDCAaveV3Earn,
          promoCardWSTETHUSDCAaveV2Earn,
          promoCardEarnOnYourAssets,
        ],
        DAI: [promoCardDsr, promoCardEarnOnYourAssets, promoCardFullySelfCustodial],
      },
    },
  }
}
