import { BaseNetworkNames } from 'blockchain/networks'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

export const aaveV2ProductHubProducts: ProductHubItem[] = [
  {
    product: [ProductHubProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'ETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [ProductHubProductType.Multiply],
    primaryToken: 'STETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'STETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long STETH',
  },
  {
    product: [ProductHubProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'WBTC/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: [ProductHubProductType.Earn],
    primaryTokenGroup: 'ETH',
    primaryToken: 'STETH',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'STETH/ETH',
    earnStrategy: 'STETH/ETH Yield',
    managementType: 'active_with_liq_risk',
  },
]
