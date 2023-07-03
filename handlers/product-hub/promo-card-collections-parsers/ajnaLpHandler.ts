import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import {
  findByTokenPair,
  getActiveManagementPill,
  getAjnaTokensPill,
  parseBorrowPromoCard,
  parseEarnLiquidityProvisionPromoCard,
} from 'handlers/product-hub/helpers'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'

const commonPromoCardPayload = {
  protocol: LendingProtocol.Ajna,
}
const commonBorrowPromoCardPayload = {
  ...commonPromoCardPayload,
  pills: [getAjnaTokensPill()],
  withLtvPill: true,
}
const commonEarnPromoCardPayload = {
  ...commonPromoCardPayload,
  pills: [getActiveManagementPill(), getAjnaTokensPill()],
  withLtvPill: true,
}

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const ajnaProducts = table.filter(({ protocol }) => protocol === LendingProtocol.Ajna)
  const ajnaBorrowishProducts = ajnaProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Borrow),
  )
  const ajnaEarnProducts = ajnaProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )

  const ETHUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['ETH', 'USDC'])
  const ETHDAIAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['ETH', 'DAI'])
  const WBTCUSDCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['WBTC', 'USDC'])
  const USDCETHAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['USDC', 'ETH'])
  const USDCWBTCAjnaBorrowishProduct = findByTokenPair(ajnaBorrowishProducts, ['USDC', 'WBTC'])
  const ETHUSDCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['USDC', 'ETH'])
  const WSTETHDAIAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['DAI', 'WSTETH'])
  const WBTCDAICAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['DAI', 'WBTC'])
  const WBTCUSDCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['USDC', 'WBTC'])
  const USDCETHAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['ETH', 'USDC'])
  const USDCWBTCAjnaEarnProduct = findByTokenPair(ajnaEarnProducts, ['WBTC', 'USDC'])

  const promoCardETHUSDCAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'ETH',
    debtToken: 'USDC',
    product: ETHUSDCAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardETHDAIAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'ETH',
    debtToken: 'DAI',
    product: ETHDAIAjnaBorrowishProduct,
    ...commonBorrowPromoCardPayload,
  })
  const promoCardWBTCUSDCAjnaBorrow = parseBorrowPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    product: WBTCUSDCAjnaBorrowishProduct,
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

  const promoCardETHUSDCAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'ETH',
    debtToken: 'USDC',
    product: ETHUSDCAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })
  const promoCardWSTETHDAIAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'WSTETH',
    debtToken: 'DAI',
    product: WSTETHDAIAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })
  const promoCardWBTCUSDCAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'USDC',
    product: WBTCUSDCAjnaEarnProduct,
    ...commonEarnPromoCardPayload,
  })
  const promoCardWBTCDAIAjnaEarn = parseEarnLiquidityProvisionPromoCard({
    collateralToken: 'WBTC',
    debtToken: 'DAI',
    product: WBTCDAICAjnaEarnProduct,
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

  const promoCardHowToUseBorrowOnAjna = {
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    title: { key: 'product-hub.promo-cards.how-to-use-borrow-on-ajna' },
    description: { key: 'product-hub.promo-cards.learn-how-to-use-borrow-and-get-liquidity' },
    link: { href: EXTERNAL_LINKS.KB.AJNA, label: { key: 'Learn more' } },
  }
  const promoCardWhatIsEarnOnAjna = {
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    title: { key: 'product-hub.promo-cards.what-is-earn-on-ajna' },
    description: { key: 'product-hub.promo-cards.learn-how-can-you-earn-by-lending-your-assets' },
    link: { href: EXTERNAL_LINKS.KB.AJNA, label: { key: 'Learn more' } },
  }
  const promoCardsWhatAreAjnaRewards = {
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    title: { key: 'product-hub.promo-cards.what-are-ajna-rewards' },
    description: { key: 'product-hub.promo-cards.ajna-pools-accumulate-rewards' },
    link: { href: EXTERNAL_LINKS.KB.AJNA, label: { key: 'Learn more' } },
  }

  return {
    [ProductHubProductType.Borrow]: {
      default: [
        promoCardETHUSDCAjnaBorrow,
        promoCardWBTCUSDCAjnaBorrow,
        promoCardsWhatAreAjnaRewards,
      ],
      tokens: {
        ETH: [promoCardETHUSDCAjnaBorrow, promoCardETHDAIAjnaBorrow, promoCardsWhatAreAjnaRewards],
        WBTC: [
          promoCardWBTCUSDCAjnaBorrow,
          promoCardHowToUseBorrowOnAjna,
          promoCardsWhatAreAjnaRewards,
        ],
        USDC: [
          promoCardUSDCETHAjnaBorrow,
          promoCardUSDCWBTCAjnaBorrow,
          promoCardsWhatAreAjnaRewards,
        ],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [],
      tokens: {},
    },
    [ProductHubProductType.Earn]: {
      default: [promoCardETHUSDCAjnaEarn, promoCardWSTETHDAIAjnaEarn, promoCardsWhatAreAjnaRewards],
      tokens: {
        ETH: [promoCardUSDCETHAjnaEarn, promoCardWhatIsEarnOnAjna, promoCardsWhatAreAjnaRewards],
        WBTC: [promoCardUSDCWBTCAjnaEarn, promoCardWhatIsEarnOnAjna, promoCardsWhatAreAjnaRewards],
        USDC: [promoCardETHUSDCAjnaEarn, promoCardWBTCUSDCAjnaEarn, promoCardsWhatAreAjnaRewards],
        DAI: [promoCardWSTETHDAIAjnaEarn, promoCardWBTCDAIAjnaEarn, promoCardsWhatAreAjnaRewards],
      },
    },
  }
}
