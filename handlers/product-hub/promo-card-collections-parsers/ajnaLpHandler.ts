import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import {
  parseAjnaBorrowPromoCard,
  parseAjnaEarnPromoCard,
  parseAjnaMultiplyPromoCard,
} from 'handlers/product-hub/helpers'
import { findByTokenPair } from 'handlers/product-hub/helpers/findByTokenPair'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const ajnaProducts = table.filter((product) => product.protocol === LendingProtocol.Ajna)
  const borrowishProducts = ajnaProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Borrow),
  )
  const earnProducts = ajnaProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )

  const ETHUSDCBorrowishProduct = findByTokenPair(borrowishProducts, ['ETH', 'USDC'])
  const ETHDAIBorrowishProduct = findByTokenPair(borrowishProducts, ['ETH', 'DAI'])
  const WSTETHUSDCBorrowishProduct = findByTokenPair(borrowishProducts, ['WSTETH', 'WSTETH'])
  const WBTCUSDCBorrowishProduct = findByTokenPair(borrowishProducts, ['WBTC', 'WBTC'])
  const WBTCDAIBorrowishProduct = findByTokenPair(borrowishProducts, ['WBTC', 'DAI'])
  const USDCETHBorrowishProduct = findByTokenPair(borrowishProducts, ['USDC', 'ETH'])
  const USDCWBTCBorrowishProduct = findByTokenPair(borrowishProducts, ['USDC', 'WBTC'])
  const ETHUSDCEarnProduct = findByTokenPair(earnProducts, ['USDC', 'ETH'])
  const ETHDAIEarnProduct = findByTokenPair(earnProducts, ['DAI', 'ETH'])
  const WSTETHUSDCEarnProduct = findByTokenPair(earnProducts, ['USDC', 'WSTETH'])
  const WSTETHDAIEarnProduct = findByTokenPair(earnProducts, ['DAI', 'WSTETH'])
  const RETHDAIEarnProduct = findByTokenPair(earnProducts, ['DAI', 'RETH'])
  const WBTCUSDCEarnProduct = findByTokenPair(earnProducts, ['USDC', 'WBTC'])
  const WBTCDAIEarnProduct = findByTokenPair(earnProducts, ['DAI', 'WBTC'])
  const USDCETHEarnProduct = findByTokenPair(earnProducts, ['ETH', 'USDC'])
  const USDCWSTETHEarnProduct = findByTokenPair(earnProducts, ['WSTETH', 'USDC'])
  const USDCRETHEarnProduct = findByTokenPair(earnProducts, ['RETH', 'USDC'])
  const USDCWBTCEarnProduct = findByTokenPair(earnProducts, ['WBTC', 'USDC'])

  const promoCardLearnAboutBorrow = {
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    title: { key: 'ajna.promo-cards.get-liquidity-from-your-assets-using-ajna' },
    description: { key: 'ajna.promo-cards.learn-how-to-use-borrow-and-get-liquidity' },
    link: { href: EXTERNAL_LINKS.KB.AJNA, label: { key: 'Learn more' } },
  }
  const promoCardLearnAboutMultiply = {
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    title: { key: 'ajna.promo-cards.get-to-know-ajna-multiply' },
    description: { key: 'ajna.promo-cards.learn-how-to-use-multiply-to-optimize-your-position' },
    link: { href: EXTERNAL_LINKS.KB.AJNA, label: { key: 'Learn more' } },
  }
  const promoCardWhatIsEarn = {
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    title: { key: 'ajna.promo-cards.what-is-earn-on-ajna' },
    description: { key: 'ajna.promo-cards.learn-how-can-you-earn-by-lending-your-assets' },
    link: { href: EXTERNAL_LINKS.KB.AJNA, label: { key: 'Learn more' } },
  }
  const promoCardWhatAreTheRisksOfEarn = {
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    title: { key: 'ajna.promo-cards.what-are-the-rist-of-earn-on-ajna' },
    description: { key: 'ajna.promo-cards.learn-how-to-avoid-getting-your-position-liquidated' },
    link: { href: EXTERNAL_LINKS.KB.AJNA, label: { key: 'Learn more' } },
  }

  const promoCardETHUSDCBorrow = parseAjnaBorrowPromoCard(
    'ETH',
    'USDC',
    ETHUSDCBorrowishProduct?.maxLtv,
  )
  const promoCardETHDAIBorrow = parseAjnaBorrowPromoCard(
    'ETH',
    'DAI',
    ETHDAIBorrowishProduct?.maxLtv,
  )
  const promoCardWSTETHUSDCBorrow = parseAjnaBorrowPromoCard(
    'WSTETH',
    'USDC',
    WSTETHUSDCBorrowishProduct?.maxLtv,
  )
  const promoCardWBTCUSDCBorrow = parseAjnaBorrowPromoCard(
    'WBTC',
    'USDC',
    WBTCUSDCBorrowishProduct?.maxLtv,
  )
  const promoCardWBTCDAICBorrow = parseAjnaBorrowPromoCard(
    'WBTC',
    'DAI',
    WBTCDAIBorrowishProduct?.maxLtv,
  )
  const promoCardUSDCETHBorrow = parseAjnaBorrowPromoCard(
    'USDC',
    'ETH',
    USDCETHBorrowishProduct?.maxLtv,
  )
  const promoCardUSDCWBTCBorrow = parseAjnaBorrowPromoCard(
    'USDC',
    'WBTC',
    USDCWBTCBorrowishProduct?.maxLtv,
  )
  const promoCardETHUSDCMultiply = parseAjnaMultiplyPromoCard(
    'ETH',
    'USDC',
    ETHUSDCBorrowishProduct?.maxMultiply,
  )
  const promoCardWSTETHUSDCMultiply = parseAjnaMultiplyPromoCard(
    'WSTETH',
    'USDC',
    WSTETHUSDCBorrowishProduct?.maxMultiply,
  )
  const promoCardWBTCUSDCMultiply = parseAjnaMultiplyPromoCard(
    'WBTC',
    'USDC',
    WBTCUSDCBorrowishProduct?.maxMultiply,
  )
  const promoCardWBTCDAIMultiply = parseAjnaMultiplyPromoCard(
    'WBTC',
    'DAI',
    WBTCDAIBorrowishProduct?.maxMultiply,
  )
  const promoCardUSDCETHMultiply = parseAjnaMultiplyPromoCard(
    'USDC',
    'ETH',
    USDCETHBorrowishProduct?.maxMultiply,
  )
  const promoCardUSDCWBTCMultiply = parseAjnaMultiplyPromoCard(
    'USDC',
    'WBTC',
    USDCWBTCBorrowishProduct?.maxMultiply,
  )
  const promoCardETHUSDCEarn = parseAjnaEarnPromoCard(
    'ETH',
    'USDC',
    ETHUSDCEarnProduct?.weeklyNetApy,
  )
  const promoCardWSTETHUSDCEarn = parseAjnaEarnPromoCard(
    'WSTETH',
    'USDC',
    WSTETHUSDCEarnProduct?.weeklyNetApy,
  )
  const promoCardWSTETHDAIEarn = parseAjnaEarnPromoCard(
    'WSTETH',
    'DAI',
    WSTETHDAIEarnProduct?.weeklyNetApy,
  )
  const promoCardRETHDAIEarn = parseAjnaEarnPromoCard(
    'RETH',
    'DAI',
    RETHDAIEarnProduct?.weeklyNetApy,
  )
  const promoCardETHDAIEarn = parseAjnaEarnPromoCard('ETH', 'DAI', ETHDAIEarnProduct?.weeklyNetApy)
  const promoCardWBTCUSDCEarn = parseAjnaEarnPromoCard(
    'WBTC',
    'USDC',
    WBTCUSDCEarnProduct?.weeklyNetApy,
  )
  const promoCardWBTCDAIEarn = parseAjnaEarnPromoCard(
    'WBTC',
    'DAI',
    WBTCDAIEarnProduct?.weeklyNetApy,
  )
  const promoCardUSDCETHEarn = parseAjnaEarnPromoCard(
    'USDC',
    'ETH',
    USDCETHEarnProduct?.weeklyNetApy,
  )
  const promoCardUSDCWSTETHEarn = parseAjnaEarnPromoCard(
    'USDC',
    'WSTETH',
    USDCWSTETHEarnProduct?.weeklyNetApy,
  )
  const promoCardUSDCRETHEarn = parseAjnaEarnPromoCard(
    'USDC',
    'RETH',
    USDCRETHEarnProduct?.weeklyNetApy,
  )
  const promoCardUSDCWBTCEarn = parseAjnaEarnPromoCard(
    'USDC',
    'WBTC',
    USDCWBTCEarnProduct?.weeklyNetApy,
  )

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHUSDCBorrow, promoCardWSTETHUSDCBorrow, promoCardWBTCUSDCBorrow],
      tokens: {
        ETH: [promoCardETHUSDCBorrow, promoCardWSTETHUSDCBorrow, promoCardETHDAIBorrow],
        WBTC: [promoCardWBTCUSDCBorrow, promoCardWBTCDAICBorrow, promoCardLearnAboutBorrow],
        USDC: [promoCardUSDCETHBorrow, promoCardUSDCWBTCBorrow, promoCardLearnAboutBorrow],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [promoCardETHUSDCMultiply, promoCardWBTCUSDCMultiply, promoCardUSDCETHMultiply],
      tokens: {
        ETH: [promoCardETHUSDCMultiply, promoCardWSTETHUSDCMultiply, promoCardUSDCETHMultiply],
        WBTC: [promoCardWBTCUSDCMultiply, promoCardWBTCDAIMultiply, promoCardUSDCWBTCMultiply],
        USDC: [promoCardUSDCETHMultiply, promoCardUSDCWBTCMultiply, promoCardLearnAboutMultiply],
      },
    },
    [ProductHubProductType.Earn]: {
      default: [promoCardETHUSDCEarn, promoCardWBTCUSDCEarn, promoCardETHDAIEarn],
      tokens: {
        ETH: [promoCardUSDCETHEarn, promoCardUSDCWSTETHEarn, promoCardUSDCRETHEarn],
        WBTC: [promoCardUSDCWBTCEarn, promoCardWhatIsEarn, promoCardWhatAreTheRisksOfEarn],
        USDC: [promoCardETHUSDCEarn, promoCardWSTETHUSDCEarn, promoCardWBTCUSDCEarn],
        DAI: [promoCardWSTETHDAIEarn, promoCardRETHDAIEarn, promoCardWBTCDAIEarn],
      },
    },
  }
}
