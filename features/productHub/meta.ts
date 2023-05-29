import { BaseNetworkNames, networksByName } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { HeaderSelectorOption } from 'components/HeaderSelector'
import { ProductType } from 'features/productHub/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'

export const ALL_ASSETS = 'all assets'
export const EMPTY_FILTERS = { or: [], and: {} }

export const productHubLinksMap: { [key in ProductType]: string } = {
  borrow: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
  multiply: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
  earn: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
}

export const productHubFiltersCount: { [key in ProductType]: number } = {
  [ProductType.Borrow]: 3,
  [ProductType.Multiply]: 4,
  [ProductType.Earn]: 2,
}
export const productHubGridTemplateColumns: { [key in ProductType]: string } = {
  [ProductType.Borrow]: '270px auto 220px 220px',
  [ProductType.Multiply]: '270px auto 220px 220px 220px',
  [ProductType.Earn]: 'auto 220px 220px',
}

// TODO: find a way how to put translations into metadata
export const productHubProductOptions: { [key in ProductType]: HeaderSelectorOption } = {
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

export const productHubTokenOptions: { [key: string]: HeaderSelectorOption } = {
  all: {
    title: 'All assets',
    value: ALL_ASSETS,
  },
  ETH: {
    title: 'Ether',
    description: 'ETH/stETH/rETH',
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

export const productHubOptionsMap: {
  [key in ProductType]: {
    product: HeaderSelectorOption
    tokens: { [key: string]: HeaderSelectorOption }
  }
} = {
  borrow: {
    product: productHubProductOptions.borrow,
    tokens: {
      all: productHubTokenOptions.all,
      ETH: productHubTokenOptions.ETH,
      WBTC: productHubTokenOptions.WBTC,
      USDC: productHubTokenOptions.USDC,
    },
  },
  multiply: {
    product: productHubProductOptions.multiply,
    tokens: {
      all: productHubTokenOptions.all,
      ETH: productHubTokenOptions.ETH,
      WBTC: productHubTokenOptions.WBTC,
      USDC: productHubTokenOptions.USDC,
    },
  },
  earn: {
    product: productHubProductOptions.earn,
    tokens: {
      all: productHubTokenOptions.all,
      ETH: productHubTokenOptions.ETH,
      WBTC: productHubTokenOptions.WBTC,
      USDC: productHubTokenOptions.USDC,
      DAI: productHubTokenOptions.DAI,
    },
  },
}

export const productHubStrategyFilter = [
  {
    label: 'Long',
    value: 'long',
  },
  {
    label: 'Short',
    value: 'short',
  },
]

export const productHubNetworkFilter = [
  {
    label: networksByName[BaseNetworkNames.Ethereum].label,
    value: networksByName[BaseNetworkNames.Ethereum].name,
    image: networksByName[BaseNetworkNames.Ethereum].icon,
  },
  {
    label: networksByName[BaseNetworkNames.Arbitrum].label,
    value: networksByName[BaseNetworkNames.Arbitrum].name,
    image: networksByName[BaseNetworkNames.Arbitrum].icon,
  },
  {
    label: networksByName[BaseNetworkNames.Optimism].label,
    value: networksByName[BaseNetworkNames.Optimism].name,
    image: networksByName[BaseNetworkNames.Optimism].icon,
  },
]

export const productHubProtocolFilter = [
  {
    label: lendingProtocolsByName[LendingProtocol.Maker].label,
    value: lendingProtocolsByName[LendingProtocol.Maker].name,
    image: lendingProtocolsByName[LendingProtocol.Maker].icon,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.AaveV2].label,
    value: lendingProtocolsByName[LendingProtocol.AaveV2].name,
    image: lendingProtocolsByName[LendingProtocol.AaveV2].icon,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.AaveV3].label,
    value: lendingProtocolsByName[LendingProtocol.AaveV3].name,
    image: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.Ajna].label,
    value: lendingProtocolsByName[LendingProtocol.Ajna].name,
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
  },
]
