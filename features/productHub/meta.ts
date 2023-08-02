import { BaseNetworkNames, NetworkNames, networksByName } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { HeaderSelectorOption } from 'components/HeaderSelector'
import { ProductHubProductType } from 'features/productHub/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { getFeatureToggle } from 'helpers/useFeatureToggle'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { clone } from 'ramda'

export const ALL_ASSETS = 'all assets'

export const productHubLinksMap: { [key in ProductHubProductType]: string } = {
  borrow: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
  multiply: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
  earn: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
}

export const productHubFiltersCount: { [key in ProductHubProductType]: number } = {
  [ProductHubProductType.Borrow]: 3,
  [ProductHubProductType.Multiply]: 4,
  [ProductHubProductType.Earn]: 2,
}
export const productHubGridTemplateColumns: { [key in ProductHubProductType]: string } = {
  [ProductHubProductType.Borrow]: '270px auto 220px 220px',
  [ProductHubProductType.Multiply]: '270px auto 220px 220px 220px',
  [ProductHubProductType.Earn]: 'auto 220px 220px',
}

// TODO: find a way how to put translations into metadata
export const productHubProductOptions: { [key in ProductHubProductType]: HeaderSelectorOption } = {
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
  BTC: {
    title: 'Bitcoin',
    description: 'WBTC/TBTC',
    value: 'BTC',
    icon: 'btc_circle_color',
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
  GHO: {
    title: 'GHO stablecoin',
    description: 'GHO',
    value: 'GHO',
    icon: getToken('GHO').iconCircle,
  },
  WLD: {
    title: 'Worldcoin',
    description: 'WLD',
    value: 'WLD',
    icon: getToken('WLD').iconCircle,
  },
}

export const productHubOptionsMap: {
  [key in ProductHubProductType]: {
    product: HeaderSelectorOption
    tokens: { [key: string]: HeaderSelectorOption }
  }
} = {
  borrow: {
    product: productHubProductOptions.borrow,
    tokens: {
      all: productHubTokenOptions.all,
      ETH: productHubTokenOptions.ETH,
      BTC: productHubTokenOptions.BTC,
      USDC: productHubTokenOptions.USDC,
      DAI: productHubTokenOptions.DAI,
      GHO: productHubTokenOptions.GHO,
      WLD: productHubTokenOptions.WLD,
    },
  },
  multiply: {
    product: productHubProductOptions.multiply,
    tokens: {
      all: productHubTokenOptions.all,
      ETH: productHubTokenOptions.ETH,
      BTC: productHubTokenOptions.BTC,
      USDC: productHubTokenOptions.USDC,
      DAI: productHubTokenOptions.DAI,
      GHO: productHubTokenOptions.GHO,
    },
  },
  earn: {
    product: productHubProductOptions.earn,
    tokens: {
      all: productHubTokenOptions.all,
      ETH: productHubTokenOptions.ETH,
      BTC: productHubTokenOptions.BTC,
      USDC: productHubTokenOptions.USDC,
      DAI: productHubTokenOptions.DAI,
      GHO: productHubTokenOptions.GHO,
      WLD: productHubTokenOptions.WLD,
    },
  },
}

const productHubOptionsMapFiltered = clone(productHubOptionsMap)

if (!getFeatureToggle('Ajna')) {
  delete productHubOptionsMapFiltered.borrow.tokens.USDC
  delete productHubOptionsMapFiltered.borrow.tokens.GHO
  delete productHubOptionsMapFiltered.borrow.tokens.WLD
  delete productHubOptionsMapFiltered.earn.tokens.USDC
  delete productHubOptionsMapFiltered.earn.tokens.BTC
  delete productHubOptionsMapFiltered.earn.tokens.GHO
  delete productHubOptionsMapFiltered.earn.tokens.WLD
}
if (!getFeatureToggle('AjnaMultiply')) {
  delete productHubOptionsMapFiltered.multiply.tokens.GHO
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

export const productHubTestNetworkFilter = [
  {
    label: networksByName[BaseNetworkNames.Ethereum].label,
    value: networksByName[NetworkNames.ethereumGoerli].name,
    image: networksByName[NetworkNames.ethereumGoerli].icon,
  },
  {
    label: networksByName[BaseNetworkNames.Arbitrum].label,
    value: networksByName[NetworkNames.arbitrumGoerli].name,
    image: networksByName[NetworkNames.arbitrumGoerli].icon,
  },
  {
    label: networksByName[BaseNetworkNames.Optimism].label,
    value: networksByName[NetworkNames.optimismGoerli].name,
    image: networksByName[NetworkNames.optimismGoerli].icon,
  },
]

const productHubProtocolFilter = [
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
]

if (getFeatureToggle('Ajna')) {
  productHubProtocolFilter.push({
    label: lendingProtocolsByName[LendingProtocol.Ajna].label,
    value: lendingProtocolsByName[LendingProtocol.Ajna].name,
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
  })
}

export { productHubProtocolFilter, productHubOptionsMapFiltered }
