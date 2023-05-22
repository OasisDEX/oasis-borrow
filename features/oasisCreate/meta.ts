import { networksByName } from 'blockchain/networksConfig'
import { getToken } from 'blockchain/tokensMetadata'
import { HeaderSelectorOption } from 'components/HeaderSelector'
import { ProductType } from 'features/oasisCreate/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'

export const ALL_ASSETS = 'all assets'

export const oasisCreateLinksMap: { [key in ProductType]: string } = {
  borrow: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
  multiply: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
  earn: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
}

export const oasisCreateFiltersCount: { [key in ProductType]: number } = {
  [ProductType.Borrow]: 3,
  [ProductType.Multiply]: 4,
  [ProductType.Earn]: 2,
}
export const oasisCreateGridTemplateColumns: { [key in ProductType]: string } = {
  [ProductType.Borrow]: '250px auto 250px 250px',
  [ProductType.Multiply]: '250px auto 250px 250px 250px',
  [ProductType.Earn]: 'auto 250px 250px',
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

export const oasisCreateOptionsMap: {
  [key in ProductType]: {
    product: HeaderSelectorOption
    tokens: { [key: string]: HeaderSelectorOption }
  }
} = {
  borrow: {
    product: oasisCreateProductOptions.borrow,
    tokens: {
      all: oasisCreateTokenOptions.all,
      ETH: oasisCreateTokenOptions.ETH,
      WBTC: oasisCreateTokenOptions.WBTC,
      USDC: oasisCreateTokenOptions.USDC,
    },
  },
  multiply: {
    product: oasisCreateProductOptions.multiply,
    tokens: {
      all: oasisCreateTokenOptions.all,
      ETH: oasisCreateTokenOptions.ETH,
      WBTC: oasisCreateTokenOptions.WBTC,
      USDC: oasisCreateTokenOptions.USDC,
    },
  },
  earn: {
    product: oasisCreateProductOptions.earn,
    tokens: {
      all: oasisCreateTokenOptions.all,
      ETH: oasisCreateTokenOptions.ETH,
      WBTC: oasisCreateTokenOptions.WBTC,
      DAI: oasisCreateTokenOptions.DAI,
      USDC: oasisCreateTokenOptions.USDC,
    },
  },
}

export const oasisCreateStrategyFilter = [
  {
    label: 'Long',
    value: 'long',
  },
  {
    label: 'Short',
    value: 'short',
  },
]

export const oasisCreateNetworkFilter = [
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

export const oasisCreateProtocolFilter = [
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
