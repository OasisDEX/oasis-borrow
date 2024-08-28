import { EarnStrategies } from '@prisma/client'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubItemWithoutAddress } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

// network is added in the handler
export const makerProductHubProducts: Omit<ProductHubItemWithoutAddress, 'network'>[] = [
  {
    product: [OmniProductType.Borrow, OmniProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'ETH-A/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [OmniProductType.Borrow, OmniProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'ETH-B/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [OmniProductType.Borrow, OmniProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'ETH-C/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [OmniProductType.Borrow, OmniProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'WSTETH-A/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [OmniProductType.Borrow, OmniProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'WSTETH-B/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [OmniProductType.Borrow, OmniProductType.Multiply],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'RETH-A/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long RETH',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'DAI',
    secondaryToken: 'DAI',
    depositToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'DSR',
    managementType: 'passive',
    earnStrategy: EarnStrategies.other,
    earnStrategyDescription: 'DAI Savings Rate',
  },
]
