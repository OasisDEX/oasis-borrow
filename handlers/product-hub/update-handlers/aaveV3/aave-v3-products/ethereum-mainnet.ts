import { EarnStrategies } from '@prisma/client'
import { NetworkNames } from 'blockchain/networks'
import { depositTokensConfigList } from 'features/aave/strategies/deposit-tokens-config-list'
import { type ProductHubItemWithoutAddress, ProductHubProductType } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import type { AaveProductHubItemSeed } from 'handlers/product-hub/update-handlers/aaveV3/aave-v3-products/types'
import { parseLendingProducts } from 'helpers/parseLendingProducts'
import { LendingProtocol } from 'lendingProtocols'

export const aaveSeed: AaveProductHubItemSeed[] = [
  {
    collateral: 'WSTETH',
    debt: 'ETH',
    strategyType: 'long',
    types: ['borrow', 'earn'],
  },
  {
    collateral: 'WSTETH',
    debt: 'ETH',
    strategyType: 'long',
    types: ['borrow', 'earn'],
  },
  {
    collateral: 'CBETH',
    debt: 'ETH',
    strategyType: 'long',
    types: ['borrow', 'earn'],
  },
  {
    collateral: 'ETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'CBETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'CBETH',
    debt: 'DAI',
    strategyType: 'long',
    types: ['multiply'],
  },
  {
    collateral: 'WBTC',
    debt: 'USDC',
    strategyType: 'long',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'WSTETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'DAI',
    debt: 'ETH',
    strategyType: 'short',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'DAI',
    debt: 'WBTC',
    strategyType: 'short',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'ETH',
    debt: 'DAI',
    strategyType: 'long',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'RETH',
    debt: 'DAI',
    strategyType: 'long',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'RETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'USDC',
    debt: 'ETH',
    strategyType: 'short',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'USDC',
    debt: 'WBTC',
    strategyType: 'short',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'WBTC',
    debt: 'DAI',
    strategyType: 'long',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'WSTETH',
    debt: 'DAI',
    strategyType: 'long',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'WSTETH',
    debt: 'USDT',
    strategyType: 'long',
    types: ['multiply', 'borrow'],
  },
  {
    collateral: 'SDAI',
    debt: 'USDC',
    strategyType: 'long',
    types: ['earn', 'borrow'],
  },
  {
    collateral: 'SDAI',
    debt: 'LUSD',
    strategyType: 'long',
    types: ['earn', 'borrow'],
  },
  {
    collateral: 'SDAI',
    debt: 'FRAX',
    strategyType: 'long',
    types: ['earn', 'borrow'],
  },
  {
    collateral: 'SDAI',
    debt: 'DAI',
    strategyType: 'long',
    types: ['earn'],
  },
]

const borrowProducts = aaveSeed
  .filter((strategy) => strategy.types.includes('borrow'))
  .map((strategy): ProductHubItemWithoutAddress => {
    return {
      product: [ProductHubProductType.Borrow],
      primaryToken: strategy.collateral.toUpperCase(),
      primaryTokenGroup: getTokenGroup(strategy.collateral.toUpperCase()),
      secondaryToken: strategy.debt.toUpperCase(),
      secondaryTokenGroup: getTokenGroup(strategy.debt.toUpperCase()),
      depositToken: strategy.deposit?.toUpperCase() ?? strategy.collateral.toUpperCase(),
      label: `${strategy.collateral.toUpperCase()}/${strategy.debt.toUpperCase()}`,
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.AaveV3,
    }
  })

const earnProducts = aaveSeed
  .filter((strategy) => strategy.types.includes('earn'))
  .map((strategy): ProductHubItemWithoutAddress => {
    return {
      product: [ProductHubProductType.Earn],
      primaryToken: strategy.collateral.toUpperCase(),
      primaryTokenGroup: getTokenGroup(strategy.collateral.toUpperCase()),
      secondaryToken: strategy.debt.toUpperCase(),
      secondaryTokenGroup: getTokenGroup(strategy.debt.toUpperCase()),
      label: `${strategy.collateral.toUpperCase()}/${strategy.debt.toUpperCase()}`,
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.AaveV3,
      earnStrategyDescription: `${strategy.collateral}/${strategy.debt} Yield Loop`,
      earnStrategy: EarnStrategies.yield_loop,
      managementType: 'active',
    }
  })

const multiplyProducts = aaveSeed
  .filter((strategy) => strategy.types.includes('multiply'))
  .map((strategy): ProductHubItemWithoutAddress => {
    return {
      product: [ProductHubProductType.Multiply],
      primaryToken: strategy.collateral.toUpperCase(),
      primaryTokenGroup: getTokenGroup(strategy.collateral.toUpperCase()),
      secondaryToken: strategy.debt.toUpperCase(),
      secondaryTokenGroup: getTokenGroup(strategy.debt.toUpperCase()),
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.AaveV3,
      label: `${strategy.collateral.toUpperCase()}/${strategy.debt.toUpperCase()}`,
      multiplyStrategyType: strategy.strategyType,
      multiplyStrategy:
        strategy.strategyType === 'long' ? `Long ${strategy.collateral}` : `Short ${strategy.debt}`,
    }
  })

const lendingProducts = parseLendingProducts(
  depositTokensConfigList,
  NetworkNames.ethereumMainnet,
  LendingProtocol.AaveV3,
)

export const aaveV3EthereumMainnetProductHubProducts: ProductHubItemWithoutAddress[] = [
  ...borrowProducts,
  ...earnProducts,
  ...multiplyProducts,
  ...lendingProducts,
]
