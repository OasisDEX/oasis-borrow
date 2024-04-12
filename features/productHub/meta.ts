import { BaseNetworkNames, NetworkNames, networksByName } from 'blockchain/networks'
import type { GenericMultiselectOption } from 'components/GenericMultiselect'
import type { HeaderSelectorOption } from 'components/HeaderSelector'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubFeaturedProducts } from 'features/productHub/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import {
  selectBorrow,
  selectBorrowActive,
  selectEarn,
  selectEarnActive,
  selectMultiply,
  selectMultiplyActive,
} from 'theme/icons'
import { FeaturesEnum } from 'types/config'

export const MIN_LIQUIDITY = 3000

export const ALL_ASSETS = 'all assets'

export const productHubLinksMap: { [key in OmniProductType]: string } = {
  borrow: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
  multiply: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
  earn: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
}

export const productHubProductOptions: { [key in OmniProductType]: HeaderSelectorOption } = {
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

export const featuredProducts: ProductHubFeaturedProducts = {
  multiply: [
    {
      primaryToken: 'WSTETH',
      secondaryToken: 'USDC',
      protocol: LendingProtocol.Ajna,
      network: NetworkNames.ethereumMainnet,
      product: OmniProductType.Multiply,
    },
    {
      primaryToken: 'WBTC',
      secondaryToken: 'USDC',
      protocol: LendingProtocol.AaveV3,
      network: NetworkNames.optimismMainnet,
      product: OmniProductType.Multiply,
    },
    {
      label: 'ETH-B/DAI',
      primaryToken: 'ETH',
      secondaryToken: 'DAI',
      protocol: LendingProtocol.Maker,
      network: NetworkNames.ethereumMainnet,
      product: OmniProductType.Multiply,
    },
  ],
  earn: [
    {
      primaryToken: 'USDC',
      secondaryToken: 'USDC',
      protocol: LendingProtocol.MorphoBlue,
      network: NetworkNames.ethereumMainnet,
      product: OmniProductType.Earn,
    },
    {
      primaryToken: 'DAI',
      secondaryToken: 'DAI',
      protocol: LendingProtocol.Maker,
      network: NetworkNames.ethereumMainnet,
      product: OmniProductType.Earn,
    },
    {
      primaryToken: 'WSTETH',
      secondaryToken: 'ETH',
      protocol: LendingProtocol.AaveV3,
      network: NetworkNames.ethereumMainnet,
      product: OmniProductType.Earn,
    },
  ],
}
