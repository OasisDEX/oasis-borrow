import { EarnStrategies } from '@prisma/client'
import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubItemWithoutAddress } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

export const aaveV2ProductHubProducts: ProductHubItemWithoutAddress[] = [
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV2,
    label: 'ETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'STETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV2,
    label: 'STETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long STETH',
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: 'BTC',
    secondaryToken: 'USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV2,
    label: 'WBTC/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'STETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV2,
    label: 'STETH/ETH',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'STETH/ETH Yield Loop',
    managementType: 'active',
  },
]
