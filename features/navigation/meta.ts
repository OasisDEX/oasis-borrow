import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubFeaturedFilters } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

export const featuredMultiplyNavigationProducts: ProductHubFeaturedFilters[] = [
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
]

export const featuredEarnNavigationProducts: ProductHubFeaturedFilters[] = [
  {
    primaryToken: 'USDC',
    secondaryToken: 'USDC',
    protocol: LendingProtocol.MorphoBlue,
    network: NetworkNames.ethereumMainnet,
    product: OmniProductType.Earn,
    earnStrategyDescription: 'Steakhouse MetaMorpho Vault',
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
]
