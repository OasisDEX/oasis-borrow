import { NetworkNames } from 'blockchain/networks'
import { ProductHubItemWithoutAddress, ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

export const sparkV3ProductHubProducts: ProductHubItemWithoutAddress[] = [
  {
    product: [ProductHubProductType.Earn],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.SparkV3,
    label: 'WSTETH/ETH',
    earnStrategy: 'WSTETH/ETH Yield Loop',
    managementType: 'active',
  },
]
