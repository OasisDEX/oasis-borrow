import { EarnStrategies } from '@prisma/client'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubItemWithoutAddress } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

export const skyProductHubProducts: Omit<ProductHubItemWithoutAddress, 'network'>[] = [
  {
    product: [OmniProductType.Earn],
    primaryToken: 'USDS',
    secondaryToken: 'USDS',
    depositToken: 'USDS',
    protocol: LendingProtocol.Sky,
    label: 'SRR',
    managementType: 'passive',
    earnStrategy: EarnStrategies.other,
    earnStrategyDescription: 'Sky Rewards Rate',
  },
]
