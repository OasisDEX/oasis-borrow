import { NetworkNames } from 'blockchain/networks'
import type { ProductHubItemWithoutAddress } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

import { EarnStrategies } from '.prisma/client'

export const sparkV3ProductHubProducts: ProductHubItemWithoutAddress[] = [
  {
    product: [ProductHubProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'WSTETH/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [ProductHubProductType.Multiply],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'RETH/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long RETH',
  },
  {
    product: [ProductHubProductType.Multiply],
    primaryToken: 'ETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'ETH/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [ProductHubProductType.Multiply],
    primaryToken: 'SDAI',
    primaryTokenGroup: 'DAI',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'SDAI/ETH',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short ETH',
  },
  {
    product: [ProductHubProductType.Borrow],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'WSTETH/DAI',
  },
  {
    product: [ProductHubProductType.Borrow],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'RETH/DAI',
  },
  {
    product: [ProductHubProductType.Borrow],
    primaryToken: 'ETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'ETH/DAI',
  },
  {
    product: [ProductHubProductType.Borrow],
    primaryToken: 'SDAI',
    primaryTokenGroup: 'DAI',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'SDAI/ETH',
  },
  {
    product: [ProductHubProductType.Earn],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'WSTETH/ETH',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'WSTETH/ETH Yield Loop',
    managementType: 'active',
  },
  {
    product: [ProductHubProductType.Earn],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'RETH/ETH',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'RETH/ETH Yield Loop',
    managementType: 'active',
  },
]
