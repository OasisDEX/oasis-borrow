import { getToken } from 'blockchain/tokensMetadata'
import { HeaderSelectorOption } from 'components/HeaderSelector'
import { ProductType } from 'features/oasisCreate/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'

export const ALL_ASSETS = 'all assets'

export const oasisCreateLinksMap: { [key in ProductType]: string } = {
  borrow: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
  multiply: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
  earn: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
}

// TODO: find a way how to put translations into metadata
export const oasisCreateProductOptions: { [key in ProductType]: HeaderSelectorOption } = {
  borrow: {
    title: 'Borrow',
    description: 'Borrow against your favorite crypto assets',
    value: 'borrow',
    icon: ['selectBorrow', 'selectBorrowActive'],
  },
  multiply: {
    title: 'Multiply',
    description: 'Increase your exposure to any crypto asset',
    value: 'multiply',
    icon: ['selectMultiply', 'selectMultiplyActive'],
  },
  earn: {
    title: 'Earn',
    description: 'Earn long term yields to compound your crypto capital',
    value: 'earn',
    icon: ['selectEarn', 'selectEarnActive'],
  },
}

export const oasisCreateTokenOptions: { [key: string]: HeaderSelectorOption } = {
  all: {
    title: 'All assets',
    value: ALL_ASSETS,
    icon: ['allAssets', 'allAssetsActive'],
  },
  ETH: {
    title: 'Ether',
    description: 'ETH',
    value: 'ETH',
    icon: getToken('ETH').iconCircle,
  },
  WBTC: {
    title: 'Wrapped BTC',
    description: 'WBTC',
    value: 'WBTC',
    icon: getToken('WBTC').iconCircle,
  },
  USDC: {
    title: 'USDCoin',
    description: 'USDC',
    value: 'USDC',
    icon: getToken('USDC').iconCircle,
  },
  DAI: {
    title: 'DAI stablecoin',
    description: 'DAI',
    value: 'DAI',
    icon: getToken('DAI').iconCircle,
  },
}

export const oasisCreateOptionsMap: {
  [key in ProductType]: { product: HeaderSelectorOption; tokens: HeaderSelectorOption[] }
} = {
  borrow: {
    product: oasisCreateProductOptions.borrow,
    tokens: [
      oasisCreateTokenOptions.all,
      oasisCreateTokenOptions.ETH,
      oasisCreateTokenOptions.WBTC,
      oasisCreateTokenOptions.USDC,
    ],
  },
  multiply: {
    product: oasisCreateProductOptions.multiply,
    tokens: [
      oasisCreateTokenOptions.all,
      oasisCreateTokenOptions.ETH,
      oasisCreateTokenOptions.WBTC,
      oasisCreateTokenOptions.USDC,
    ],
  },
  earn: {
    product: oasisCreateProductOptions.earn,
    tokens: [
      oasisCreateTokenOptions.all,
      oasisCreateTokenOptions.ETH,
      oasisCreateTokenOptions.WBTC,
      oasisCreateTokenOptions.DAI,
      oasisCreateTokenOptions.USDC,
    ],
  },
}
