import { BaseNetworkNames, NetworkNames, networksByName } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import type { GenericMultiselectOption } from 'components/GenericMultiselect'
import type { HeaderSelectorOption } from 'components/HeaderSelector'
import { ProductHubProductType } from 'features/productHub/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { getLocalAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { clone } from 'ramda'
import {
  btc_circle_color,
  selectBorrow,
  selectBorrowActive,
  selectEarn,
  selectEarnActive,
  selectMultiply,
  selectMultiplyActive,
} from 'theme/icons'
import { FeaturesEnum } from 'types/config'

export const MIN_LIQUIDITY = 10000

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
    icon: [selectBorrow, selectBorrowActive],
  },
  multiply: {
    title: 'Multiply',
    description: 'Increase your exposure to any crypto asset',
    value: 'multiply',
    icon: [selectMultiply, selectMultiplyActive],
  },
  earn: {
    title: 'Earn',
    description: 'Earn long term yields to compound your crypto capital',
    value: 'earn',
    icon: [selectEarn, selectEarnActive],
  },
}

export const productHubTokenOptions: { [key: string]: HeaderSelectorOption } = {
  all: {
    title: 'All assets',
    value: ALL_ASSETS,
  },
  ETH: {
    title: 'Ether',
    description: 'ETH/stETH/cbETH/rETH',
    value: 'ETH',
    icon: getToken('ETH').iconCircle,
  },
  BTC: {
    title: 'Bitcoin',
    description: 'WBTC',
    value: 'BTC',
    icon: btc_circle_color,
  },
  USDC: {
    title: 'USDCoin',
    description: 'USDC/USDbC',
    value: 'USDC',
    icon: getToken('USDC').iconCircle,
  },
  DAI: {
    title: 'DAI stablecoin',
    description: 'DAI',
    value: 'DAI',
    icon: getToken('DAI').iconCircle,
  },
  YFI: {
    title: 'Yearn',
    description: 'YFI',
    value: 'YFI',
    icon: getToken('YFI').iconCircle,
  },
  SUSDE: {
    title: 'Ethena Staked USDe',
    description: 'SUSDE',
    value: 'SUSDE',
    icon: getToken('SUSDE').iconCircle,
  },
  USDT: {
    title: 'USDT stablecoin',
    description: 'USDT',
    value: 'USDT',
    icon: getToken('USDT').iconCircle,
  },
  MKR: {
    title: 'MKR MakerDAO',
    description: 'MKR',
    value: 'MKR',
    icon: getToken('MKR').iconCircle,
  },
  LINK: {
    title: 'Chainlink LINK',
    description: 'LINK',
    value: 'LINK',
    icon: getToken('LINK').iconCircle,
  },
  LDO: {
    title: 'Lido LDO',
    description: 'LDO',
    value: 'LDO',
    icon: getToken('LDO').iconCircle,
  },
}

export const productHubOptionsMapBase: {
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
      USDT: productHubTokenOptions.USDT,
      DAI: productHubTokenOptions.DAI,
      SUSDE: productHubTokenOptions.SUSDE,
      MKR: productHubTokenOptions.MKR,
      LINK: productHubTokenOptions.LINK,
      LDO: productHubTokenOptions.LDO,
      YFI: productHubTokenOptions.YFI,
    },
  },
  multiply: {
    product: productHubProductOptions.multiply,
    tokens: {
      all: productHubTokenOptions.all,
      ETH: productHubTokenOptions.ETH,
      BTC: productHubTokenOptions.BTC,
      USDC: productHubTokenOptions.USDC,
      USDT: productHubTokenOptions.USDT,
      DAI: productHubTokenOptions.DAI,
      SUSDE: productHubTokenOptions.SUSDE,
      MKR: productHubTokenOptions.MKR,
      LINK: productHubTokenOptions.LINK,
      LDO: productHubTokenOptions.LDO,
      YFI: productHubTokenOptions.YFI,
    },
  },
  earn: {
    product: productHubProductOptions.earn,
    tokens: {
      all: productHubTokenOptions.all,
      ETH: productHubTokenOptions.ETH,
      BTC: productHubTokenOptions.BTC,
      USDC: productHubTokenOptions.USDC,
      USDT: productHubTokenOptions.USDT,
      DAI: productHubTokenOptions.DAI,
      SUSDE: productHubTokenOptions.SUSDE,
      MKR: productHubTokenOptions.MKR,
      LINK: productHubTokenOptions.LINK,
      LDO: productHubTokenOptions.LDO,
      YFI: productHubTokenOptions.YFI,
    },
  },
}

const productHubOptionsMap = clone(productHubOptionsMapBase)

if (getLocalAppConfig('features')[FeaturesEnum.AjnaSafetySwitch]) {
  delete productHubOptionsMap.borrow.tokens.YFI
  delete productHubOptionsMap.borrow.tokens.GHO
  delete productHubOptionsMap.multiply.tokens.YFI
  delete productHubOptionsMap.multiply.tokens.GHO
  delete productHubOptionsMap.earn.tokens.BTC
  delete productHubOptionsMap.earn.tokens.USDC
  delete productHubOptionsMap.earn.tokens.GHO
}

export { productHubOptionsMap }

export const productHubStrategyFilter: GenericMultiselectOption[] = [
  {
    label: 'Long',
    value: 'long',
  },
  {
    label: 'Short',
    value: 'short',
  },
]

export const productHubNetworkFilter: GenericMultiselectOption[] = [
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
  {
    label: networksByName[BaseNetworkNames.Base].label,
    value: networksByName[BaseNetworkNames.Base].name,
    image: networksByName[BaseNetworkNames.Base].icon,
    featureFlag: FeaturesEnum.BaseNetworkEnabled,
  },
]

export const productHubTestNetworkFilter: GenericMultiselectOption[] = [
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

export const productHubProtocolFilter: GenericMultiselectOption[] = [
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
  {
    label: lendingProtocolsByName[LendingProtocol.Maker].label,
    value: lendingProtocolsByName[LendingProtocol.Maker].name,
    image: lendingProtocolsByName[LendingProtocol.Maker].icon,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.MorphoBlue].label,
    value: lendingProtocolsByName[LendingProtocol.MorphoBlue].name,
    image: lendingProtocolsByName[LendingProtocol.MorphoBlue].icon,
    featureFlag: FeaturesEnum.MorphoBlue,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.SparkV3].label,
    value: lendingProtocolsByName[LendingProtocol.SparkV3].name,
    image: lendingProtocolsByName[LendingProtocol.SparkV3].icon,
  },
]
