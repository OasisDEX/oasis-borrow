import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { PromoCardProps, PromoCardVariant } from 'components/PromoCard'
import {
  ProductHubItem,
  ProductHubProductType,
  ProductHubPromoCards,
} from 'features/productHub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'

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
    icon: getToken(collateralToken).iconCircle,
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

  const promoCardETHUSDCBorrow = parseBorrowishPromoCard('ETH', 'USDC', ETHUSDCBorrowish?.maxLtv)
  const promoCardETHDAIBorrow = parseBorrowishPromoCard('ETH', 'DAI', ETHDAIBorrowish?.maxLtv)
  const promoCardWSTETHUSDCBorrow = parseBorrowishPromoCard(
    'WSTETH',
    'USDC',
    WSTETHUSDCBorrowish?.maxLtv,
  )
  const promoCardWBTCUSDCBorrow = parseBorrowishPromoCard('WBTC', 'USDC', WBTCUSDCBorrowish?.maxLtv)

  return {
    [ProductHubProductType.Borrow]: {
      default: [promoCardETHUSDCBorrow, promoCardWSTETHUSDCBorrow, promoCardWBTCUSDCBorrow],
      tokens: {
        ETH: [promoCardETHUSDCBorrow, promoCardWSTETHUSDCBorrow, promoCardETHDAIBorrow],
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
