import type { ProductHubItemWithoutAddress } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

// network is added in the handler
export const makerProductHubProducts: Omit<ProductHubItemWithoutAddress, 'network'>[] = [
  {
    product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'ETH-A/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'ETH-B/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'ETH-C/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'WSTETH-A/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'WSTETH-B/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'RETH-A/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long RETH',
  },
  {
    product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: 'BTC',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'WBTC-A/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: 'BTC',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'WBTC-B/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: 'BTC',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'WBTC-C/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: [ProductHubProductType.Earn],
    primaryToken: 'DAI',
    secondaryToken: 'DAI',
    protocol: LendingProtocol.Maker,
    label: 'DSR',
    managementType: 'passive',
    earnStrategy: 'DAI Savings Rate',
  },
]
