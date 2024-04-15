import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubPromoCardFilters } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

export const featuredMultiplyNavigationProducts: ProductHubPromoCardFilters[] = [
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

export const featuredEarnNavigationProducts: ProductHubPromoCardFilters[] = [
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
]
