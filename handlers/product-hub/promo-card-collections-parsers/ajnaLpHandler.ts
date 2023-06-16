import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { PromoCardProps, PromoCardVariant } from 'components/PromoCard'
import { isShortPosition } from 'features/ajna/positions/common/helpers/isShortPosition'
import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'

const protocol = { network: NetworkNames.ethereumMainnet, protocol: LendingProtocol.Ajna }
const getAjnaTokensPill = {
  label: { key: 'ajna.promo-cards.get-ajna-tokens' },
  variant: 'positive' as PromoCardVariant,
}

function parseBorrowishPromoCard(
  collateralToken: string,
  quoteToken: string,
  maxLtv?: string,
): PromoCardProps {
  return {
    tokens: [collateralToken, quoteToken],
    title: `${collateralToken}/${quoteToken}`,
    description: {
      key: 'ajna.promo-cards.borrow-and-earn-ajna',
      props: { collateralToken, quoteToken },
    },
    protocol,
    pills: [
      {
        label: {
          key: 'ajna.promo-cards.max-ltv',
          props: {
            maxLtv: maxLtv ? formatDecimalAsPercent(new BigNumber(maxLtv)) : 'n/a',
          },
        },
      },
      getAjnaTokensPill,
    ],
  }
}

function parseMultiplyPromoCard(
  collateralToken: string,
  quoteToken: string,
  maxMultiply?: string,
): PromoCardProps {
  const isShort = isShortPosition({ collateralToken })

  return {
    tokens: [collateralToken, quoteToken],
    title: `${collateralToken}/${quoteToken}`,
    description: {
      key: 'ajna.promo-cards.multiply-and-earn-ajna',
      props: {
        token: isShort ? quoteToken : collateralToken,
        strategy: isShort ? 'Short' : 'Long',
      },
    },
    protocol,
    pills: [
      {
        label: {
          key: 'ajna.promo-cards.up-to-multiple',
          props: {
            maxMultiple: maxMultiply ? parseFloat(maxMultiply).toFixed(2) : 'n/a',
          },
        },
      },
      getAjnaTokensPill,
    ],
  }
}

export default function (table: ProductHubItem[]): ProductHubPromoCards {
  const ajnaProducts = table.filter((product) => product.protocol === LendingProtocol.Ajna)
  const borrowishProducts = ajnaProducts.filter((product) =>
    product.product.includes(ProductHubProductType.Borrow),
  )

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

  const promoCardETHUSDCBorrow = parseBorrowishPromoCard('ETH', 'USDC', ETHUSDCBorrowish?.maxLtv)
  const promoCardETHDAIBorrow = parseBorrowishPromoCard('ETH', 'DAI', ETHDAIBorrowish?.maxLtv)
  const promoCardWSTETHUSDCBorrow = parseBorrowishPromoCard(
    'WSTETH',
    'USDC',
    WSTETHUSDCBorrowish?.maxLtv,
  )
  const promoCardWBTCUSDCBorrow = parseBorrowishPromoCard('WBTC', 'USDC', WBTCUSDCBorrowish?.maxLtv)
  const promoCardWBTCDAICBorrow = parseBorrowishPromoCard('WBTC', 'DAI', WBTCDAIBorrowish?.maxLtv)
  const promoCardUSDCETHBorrow = parseBorrowishPromoCard('USDC', 'ETH', USDCETHBorrowish?.maxLtv)
  const promoCardUSDCWBTCBorrow = parseBorrowishPromoCard('USDC', 'WBTC', USDCWBTCBorrowish?.maxLtv)
  const promoCardETHUSDCMultiply = parseMultiplyPromoCard(
    'ETH',
    'USDC',
    ETHUSDCBorrowish?.maxMultiply,
  )
  const promoCardWBTCUSDCMultiply = parseMultiplyPromoCard(
    'WBTC',
    'USDC',
    WBTCUSDCBorrowish?.maxMultiply,
  )
  const promoCardUSDCETHMultiply = parseMultiplyPromoCard(
    'USDC',
    'ETH',
    USDCETHBorrowish?.maxMultiply,
  )

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
      tokens: {},
    },
    [ProductHubProductType.Earn]: {
      default: [],
      tokens: {},
    },
  }
}
