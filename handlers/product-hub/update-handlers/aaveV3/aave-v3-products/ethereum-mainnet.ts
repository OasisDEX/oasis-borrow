import { EarnStrategies } from '@prisma/client'
import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import { productHubWeETHRewardsTooltip } from 'features/productHub/content'
import { type ProductHubItemWithoutAddress } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers/get-token-group'
import { LendingProtocol } from 'lendingProtocols'

export const aaveV3EthereumMainnetProductHubProducts: ProductHubItemWithoutAddress[] = [
  // ethereum products
  {
    product: [OmniProductType.Earn],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/ETH',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'WSTETH/ETH Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    depositToken: 'RETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'RETH/ETH',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'RETH/ETH Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    depositToken: 'CBETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'CBETH/ETH',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'CBETH/ETH Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'WEETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'WEETH/ETH',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'WEETH/ETH Yield Loop',
    managementType: 'active',
    hasRewards: true,
    tooltips: {
      liquidity: { ...productHubWeETHRewardsTooltip },
    },
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'ETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    depositToken: 'ETH',
    label: 'ETH/USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    depositToken: 'CBETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'CBETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long CBETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    depositToken: 'CBETH',
    label: 'CBETH/USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'CBETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'CBETH/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long CBETH',
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: 'BTC',
    secondaryToken: 'USDC',
    depositToken: 'WBTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'WBTC/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WBTC',
    primaryTokenGroup: 'BTC',
    secondaryToken: 'USDC',
    depositToken: 'WBTC',
    label: 'WBTC/USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    depositToken: 'WSTETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    depositToken: 'WSTETH',
    label: 'WSTETH/USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'DAI',
    secondaryToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'DAI/ETH',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short ETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'DAI',
    secondaryToken: 'ETH',
    depositToken: 'DAI',
    label: 'DAI/ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'DAI',
    secondaryToken: 'WBTC',
    secondaryTokenGroup: 'BTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'DAI/WBTC',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short WBTC',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'DAI',
    secondaryToken: 'WBTC',
    secondaryTokenGroup: 'BTC',
    depositToken: 'DAI',
    label: 'DAI/WBTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'ETH/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'ETH',
    label: 'ETH/DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'RETH/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long rETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'RETH',
    label: 'RETH/DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'RETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long rETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    depositToken: 'RETH',
    label: 'RETH/USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'USDC',
    secondaryToken: 'ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'USDC/ETH',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short ETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'USDC',
    secondaryToken: 'ETH',
    depositToken: 'USDC',
    label: 'USDC/ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'USDC',
    secondaryToken: 'WBTC',
    secondaryTokenGroup: 'BTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'USDC/WBTC',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short WBTC',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'USDC',
    secondaryToken: 'WBTC',
    secondaryTokenGroup: 'BTC',
    depositToken: 'USDC',
    label: 'USDC/WBTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: 'BTC',
    secondaryToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'WBTC/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WBTC',
    primaryTokenGroup: 'BTC',
    secondaryToken: 'DAI',
    depositToken: 'WBTC',
    label: 'WBTC/DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    depositToken: 'WSTETH',
    label: 'WSTETH/DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'SDAI',
    primaryTokenGroup: 'DAI',
    secondaryToken: 'USDC',
    depositToken: 'SDAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'SDAI/USDC',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'SDAI/USDC Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'SDAI',
    primaryTokenGroup: 'DAI',
    secondaryToken: 'LUSD',
    depositToken: 'SDAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'SDAI/LUSD',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'SDAI/LUSD Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'SDAI',
    primaryTokenGroup: 'DAI',
    secondaryToken: 'FRAX',
    depositToken: 'SDAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'SDAI/FRAX',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'SDAI/FRAX Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'SDAI',
    primaryTokenGroup: 'DAI',
    secondaryToken: 'DAI',
    depositToken: 'SDAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'SDAI/DAI',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'SDAI/DAI Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'SUSDE',
    primaryTokenGroup: getTokenGroup('SUSDE'),
    secondaryToken: 'DAI',
    depositToken: 'SUSDE',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'SUSDE/DAI',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'SUSDE/DAI Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'SUSDE',
    primaryTokenGroup: getTokenGroup('SUSDE'),
    secondaryToken: 'USDC',
    depositToken: 'SUSDE',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'SUSDE/USDC',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'SUSDE/USDC Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Earn],
    primaryToken: 'SUSDE',
    primaryTokenGroup: getTokenGroup('SUSDE'),
    secondaryToken: 'USDT',
    depositToken: 'SUSDE',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'SUSDE/USDT',
    earnStrategy: EarnStrategies.yield_loop,
    earnStrategyDescription: 'SUSDE/USDT Yield Loop',
    managementType: 'active',
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/USDT',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDT',
    depositToken: 'WSTETH',
    label: 'WSTETH/USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'GHO',
    depositToken: 'CBETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
    label: 'CBETH/GHO',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long CBETH',
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'GHO',
    depositToken: 'CBETH',
    label: 'CBETH/GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'LDO',
    primaryTokenGroup: getTokenGroup('LDO'),
    secondaryToken: 'USDT',
    depositToken: 'LDO',
    label: 'LDO/USDT',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long LDO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'LDO',
    primaryTokenGroup: getTokenGroup('LDO'),
    secondaryToken: 'USDT',
    depositToken: 'LDO',
    label: 'LDO/USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },

  {
    product: [OmniProductType.Multiply],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'DAI',
    depositToken: 'LINK',
    label: 'LINK/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long LINK',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'DAI',
    depositToken: 'LINK',
    label: 'LINK/DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'GHO',
    depositToken: 'LINK',
    label: 'LINK/GHO',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long LINK',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'GHO',
    depositToken: 'LINK',
    label: 'LINK/GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'USDC',
    depositToken: 'LINK',
    label: 'LINK/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long LINK',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'USDC',
    depositToken: 'LINK',
    label: 'LINK/USDC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'USDT',
    depositToken: 'LINK',
    label: 'LINK/USDT',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long LINK',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'USDT',
    depositToken: 'LINK',
    label: 'LINK/USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'ETH',
    depositToken: 'LINK',
    label: 'LINK/ETH',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long LINK',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'LINK',
    primaryTokenGroup: getTokenGroup('LINK'),
    secondaryToken: 'ETH',
    depositToken: 'LINK',
    label: 'LINK/ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'MKR',
    primaryTokenGroup: getTokenGroup('MKR'),
    secondaryToken: 'DAI',
    depositToken: 'MKR',
    label: 'MKR/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long MKR',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'MKR',
    primaryTokenGroup: getTokenGroup('MKR'),
    secondaryToken: 'DAI',
    depositToken: 'MKR',
    label: 'MKR/DAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'RETH',
    primaryTokenGroup: getTokenGroup('RETH'),
    secondaryToken: 'GHO',
    depositToken: 'RETH',
    label: 'RETH/GHO',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long RETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'RETH',
    primaryTokenGroup: getTokenGroup('RETH'),
    secondaryToken: 'GHO',
    depositToken: 'RETH',
    label: 'RETH/GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'RETH',
    primaryTokenGroup: getTokenGroup('RETH'),
    secondaryToken: 'USDT',
    depositToken: 'RETH',
    label: 'RETH/USDT',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long RETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'RETH',
    primaryTokenGroup: getTokenGroup('RETH'),
    secondaryToken: 'USDT',
    depositToken: 'RETH',
    label: 'RETH/USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'SDAI',
    primaryTokenGroup: getTokenGroup('SDAI'),
    secondaryToken: 'GHO',
    depositToken: 'SDAI',
    label: 'SDAI/GHO',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long SDAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'SDAI',
    primaryTokenGroup: getTokenGroup('SDAI'),
    secondaryToken: 'GHO',
    depositToken: 'SDAI',
    label: 'SDAI/GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'SDAI',
    primaryTokenGroup: getTokenGroup('SDAI'),
    secondaryToken: 'USDT',
    depositToken: 'SDAI',
    label: 'SDAI/USDT',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long SDAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'SDAI',
    primaryTokenGroup: getTokenGroup('SDAI'),
    secondaryToken: 'USDT',
    depositToken: 'SDAI',
    label: 'SDAI/USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'SDAI',
    primaryTokenGroup: getTokenGroup('SDAI'),
    secondaryToken: 'WBTC',
    depositToken: 'SDAI',
    label: 'SDAI/WBTC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long SDAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'SDAI',
    primaryTokenGroup: getTokenGroup('SDAI'),
    secondaryToken: 'WBTC',
    depositToken: 'SDAI',
    label: 'SDAI/WBTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'SDAI',
    primaryTokenGroup: getTokenGroup('SDAI'),
    secondaryToken: 'ETH',
    depositToken: 'SDAI',
    label: 'SDAI/ETH',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long SDAI',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'SDAI',
    primaryTokenGroup: getTokenGroup('SDAI'),
    secondaryToken: 'ETH',
    depositToken: 'SDAI',
    label: 'SDAI/ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: getTokenGroup('WBTC'),
    secondaryToken: 'GHO',
    depositToken: 'WBTC',
    label: 'WBTC/GHO',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WBTC',
    primaryTokenGroup: getTokenGroup('WBTC'),
    secondaryToken: 'GHO',
    depositToken: 'WBTC',
    label: 'WBTC/GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: getTokenGroup('WBTC'),
    secondaryToken: 'LUSD',
    depositToken: 'WBTC',
    label: 'WBTC/LUSD',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WBTC',
    primaryTokenGroup: getTokenGroup('WBTC'),
    secondaryToken: 'LUSD',
    depositToken: 'WBTC',
    label: 'WBTC/LUSD',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: getTokenGroup('WBTC'),
    secondaryToken: 'USDT',
    depositToken: 'WBTC',
    label: 'WBTC/USDT',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WBTC',
    primaryTokenGroup: getTokenGroup('WBTC'),
    secondaryToken: 'USDT',
    depositToken: 'WBTC',
    label: 'WBTC/USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WBTC',
    primaryTokenGroup: getTokenGroup('WBTC'),
    secondaryToken: 'ETH',
    depositToken: 'WBTC',
    label: 'WBTC/ETH',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WBTC',
    primaryTokenGroup: getTokenGroup('WBTC'),
    secondaryToken: 'ETH',
    depositToken: 'WBTC',
    label: 'WBTC/ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'ETH',
    primaryTokenGroup: getTokenGroup('ETH'),
    secondaryToken: 'GHO',
    depositToken: 'ETH',
    label: 'ETH/GHO',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'ETH',
    primaryTokenGroup: getTokenGroup('ETH'),
    secondaryToken: 'GHO',
    depositToken: 'ETH',
    label: 'ETH/GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WEETH',
    primaryTokenGroup: getTokenGroup('WEETH'),
    secondaryToken: 'GHO',
    depositToken: 'WEETH',
    label: 'WEETH/GHO',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WEETH',
    primaryTokenGroup: getTokenGroup('WEETH'),
    secondaryToken: 'GHO',
    depositToken: 'WEETH',
    label: 'WEETH/GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'ETH',
    primaryTokenGroup: getTokenGroup('ETH'),
    secondaryToken: 'USDT',
    depositToken: 'ETH',
    label: 'ETH/USDT',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'ETH',
    primaryTokenGroup: getTokenGroup('ETH'),
    secondaryToken: 'USDT',
    depositToken: 'ETH',
    label: 'ETH/USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'ETH',
    primaryTokenGroup: getTokenGroup('ETH'),
    secondaryToken: 'WBTC',
    depositToken: 'ETH',
    label: 'ETH/WBTC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'ETH',
    primaryTokenGroup: getTokenGroup('ETH'),
    secondaryToken: 'WBTC',
    depositToken: 'ETH',
    label: 'ETH/WBTC',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: getTokenGroup('WSTETH'),
    secondaryToken: 'CBETH',
    depositToken: 'WSTETH',
    label: 'WSTETH/CBETH',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WSTETH',
    primaryTokenGroup: getTokenGroup('WSTETH'),
    secondaryToken: 'CBETH',
    depositToken: 'WSTETH',
    label: 'WSTETH/CBETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: getTokenGroup('WSTETH'),
    secondaryToken: 'GHO',
    depositToken: 'WSTETH',
    label: 'WSTETH/GHO',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WSTETH',
    primaryTokenGroup: getTokenGroup('WSTETH'),
    secondaryToken: 'GHO',
    depositToken: 'WSTETH',
    label: 'WSTETH/GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: getTokenGroup('WSTETH'),
    secondaryToken: 'LUSD',
    depositToken: 'WSTETH',
    label: 'WSTETH/LUSD',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WSTETH',
    primaryTokenGroup: getTokenGroup('WSTETH'),
    secondaryToken: 'LUSD',
    depositToken: 'WSTETH',
    label: 'WSTETH/LUSD',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: getTokenGroup('WSTETH'),
    secondaryToken: 'RPL',
    depositToken: 'WSTETH',
    label: 'WSTETH/RPL',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'WSTETH',
    primaryTokenGroup: getTokenGroup('WSTETH'),
    secondaryToken: 'RPL',
    depositToken: 'WSTETH',
    label: 'WSTETH/RPL',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'DAI',
    primaryTokenGroup: getTokenGroup('DAI'),
    secondaryToken: 'MKR',
    depositToken: 'DAI',
    label: 'DAI/MKR',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'USDC',
    primaryTokenGroup: getTokenGroup('USDC'),
    secondaryToken: 'GHO',
    depositToken: 'USDC',
    label: 'USDC/GHO',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'USDC',
    primaryTokenGroup: getTokenGroup('USDC'),
    secondaryToken: 'GHO',
    depositToken: 'USDC',
    label: 'USDC/GHO',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'USDC',
    primaryTokenGroup: getTokenGroup('USDC'),
    secondaryToken: 'USDT',
    depositToken: 'USDC',
    label: 'USDC/USDT',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'USDC',
    primaryTokenGroup: getTokenGroup('USDC'),
    secondaryToken: 'USDT',
    depositToken: 'USDC',
    label: 'USDC/USDT',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'USDC',
    primaryTokenGroup: getTokenGroup('USDC'),
    secondaryToken: 'WSTETH',
    depositToken: 'USDC',
    label: 'USDC/WSTETH',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short WSTETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'USDC',
    primaryTokenGroup: getTokenGroup('USDC'),
    secondaryToken: 'WSTETH',
    depositToken: 'USDC',
    label: 'USDC/WSTETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Multiply],
    primaryToken: 'USDT',
    primaryTokenGroup: getTokenGroup('USDT'),
    secondaryToken: 'ETH',
    depositToken: 'USDT',
    label: 'USDT/ETH',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
  {
    product: [OmniProductType.Borrow],
    primaryToken: 'USDT',
    primaryTokenGroup: getTokenGroup('USDT'),
    secondaryToken: 'ETH',
    depositToken: 'USDT',
    label: 'USDT/ETH',
    network: NetworkNames.ethereumMainnet,
    protocol: LendingProtocol.AaveV3,
  },
]
