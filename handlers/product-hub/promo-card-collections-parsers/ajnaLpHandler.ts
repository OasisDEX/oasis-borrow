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
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const ajnaProducts = table.filter((product) => product.protocol === LendingProtocol.Ajna)
  const borrowishProducts = ajnaProducts.filter((product) =>
    product.product.includes(ProductHubProductType.Borrow),
  )
  // const earnProducts = ajnaProducts.filter((product) =>
  //   product.product.includes(ProductHubProductType.Earn),
  // )

  const ETHUSDCBorrowish = borrowishProducts.find(
    (product) => product.primaryToken === 'ETH' && product.secondaryToken === 'USDC',
  )
  const ETHDAIBorrowish = borrowishProducts.find(
    (product) => product.primaryToken === 'ETH' && product.secondaryToken === 'DAI',
  )
  const WSTETHUSDCBorrowish = borrowishProducts.find(
    (product) => product.primaryToken === 'WSTETH' && product.secondaryToken === 'USDC',
  )
  const WBTCUSDCBorrowish = borrowishProducts.find(
    (product) => product.primaryToken === 'WBTC' && product.secondaryToken === 'USDC',
  )
  const WBTCDAIBorrowish = borrowishProducts.find(
    (product) => product.primaryToken === 'WBTC' && product.secondaryToken === 'DAI',
  )
  const USDCETHBorrowish = borrowishProducts.find(
    (product) => product.primaryToken === 'USDC' && product.secondaryToken === 'ETH',
  )
  const USDCWBTCBorrowish = borrowishProducts.find(
    (product) => product.primaryToken === 'USDC' && product.secondaryToken === 'WBTC',
  )

  const promoCardBorrowGeneral = {
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    title: { key: 'ajna.promo-cards.get-liquidity-from-your-assets-using-ajna' },
    description: { key: 'ajna.promo-cards.learn-how-to-use-borrow-and-get-liquidity' },
    link: { href: EXTERNAL_LINKS.KB.AJNA, label: { key: 'Learn more' } },
  }
  const promoCardMultiplyGeneral = {
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
    title: { key: 'ajna.promo-cards.get-to-know-ajna-multiply' },
    description: { key: 'ajna.promo-cards.learn-how-to-use-multiply-to-optimize-your-position' },
    link: { href: EXTERNAL_LINKS.KB.AJNA, label: { key: 'Learn more' } },
  }

  const promoCardETHUSDCBorrow = parseAjnaBorrowPromoCard('ETH', 'USDC', ETHUSDCBorrowish?.maxLtv)
  const promoCardETHDAIBorrow = parseAjnaBorrowPromoCard('ETH', 'DAI', ETHDAIBorrowish?.maxLtv)
  const promoCardWSTETHUSDCBorrow = parseAjnaBorrowPromoCard(
    'WSTETH',
    'USDC',
    WSTETHUSDCBorrowish?.maxLtv,
  )
  const promoCardWBTCUSDCBorrow = parseAjnaBorrowPromoCard(
    'WBTC',
    'USDC',
    WBTCUSDCBorrowish?.maxLtv,
  )
  const promoCardWBTCDAICBorrow = parseAjnaBorrowPromoCard('WBTC', 'DAI', WBTCDAIBorrowish?.maxLtv)
  const promoCardUSDCETHBorrow = parseAjnaBorrowPromoCard('USDC', 'ETH', USDCETHBorrowish?.maxLtv)
  const promoCardUSDCWBTCBorrow = parseAjnaBorrowPromoCard(
    'USDC',
    'WBTC',
    USDCWBTCBorrowish?.maxLtv,
  )
  const promoCardETHUSDCMultiply = parseAjnaMultiplyPromoCard(
    'ETH',
    'USDC',
    ETHUSDCBorrowish?.maxMultiply,
  )
  const promoCardWSTETHUSDCMultiply = parseAjnaMultiplyPromoCard(
    'WSTETH',
    'USDC',
    WSTETHUSDCBorrowish?.maxMultiply,
  )
  const promoCardWBTCUSDCMultiply = parseAjnaMultiplyPromoCard(
    'WBTC',
    'USDC',
    WBTCUSDCBorrowish?.maxMultiply,
  )
  const promoCardWBTCDAIMultiply = parseAjnaMultiplyPromoCard(
    'WBTC',
    'DAI',
    WBTCDAIBorrowish?.maxMultiply,
  )
  const promoCardUSDCETHMultiply = parseAjnaMultiplyPromoCard(
    'USDC',
    'ETH',
    USDCETHBorrowish?.maxMultiply,
  )
  const promoCardUSDCWBTCMultiply = parseAjnaMultiplyPromoCard(
    'USDC',
    'WBTC',
    USDCWBTCBorrowish?.maxMultiply,
  )
  const promoCardETHUSDCEarn = parseAjnaEarnPromoCard('ETH', 'USDC')
  const promoCardWBTCUSDCEarn = parseAjnaEarnPromoCard('WBTC', 'USDC')
  const promoCardETHDAIEarn = parseAjnaEarnPromoCard('ETH', 'DAI')

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHUSDCBorrow, promoCardWSTETHUSDCBorrow, promoCardWBTCUSDCBorrow],
      tokens: {
        ETH: [promoCardETHUSDCBorrow, promoCardWSTETHUSDCBorrow, promoCardETHDAIBorrow],
        WBTC: [promoCardWBTCUSDCBorrow, promoCardWBTCDAICBorrow, promoCardBorrowGeneral],
        USDC: [promoCardUSDCETHBorrow, promoCardUSDCWBTCBorrow, promoCardBorrowGeneral],
      },
    },
    [ProductHubProductType.Multiply]: {
      default: [promoCardETHUSDCMultiply, promoCardWBTCUSDCMultiply, promoCardUSDCETHMultiply],
      tokens: {
        ETH: [promoCardETHUSDCMultiply, promoCardWSTETHUSDCMultiply, promoCardUSDCETHMultiply],
        WBTC: [promoCardWBTCUSDCMultiply, promoCardWBTCDAIMultiply, promoCardUSDCWBTCMultiply],
        USDC: [promoCardUSDCETHMultiply, promoCardUSDCWBTCMultiply, promoCardMultiplyGeneral],
      },
    },
    [ProductHubProductType.Earn]: {
      default: [promoCardETHUSDCEarn, promoCardWBTCUSDCEarn, promoCardETHDAIEarn],
      tokens: {},
    },
  }
}
