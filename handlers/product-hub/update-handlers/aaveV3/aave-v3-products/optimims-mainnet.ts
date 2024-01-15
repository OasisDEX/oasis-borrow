import { EarnStrategies } from '@prisma/client'
import { NetworkNames } from 'blockchain/networks'
import { depositTokensList } from 'features/aave/strategies/deposit-tokens-list'
import { type ProductHubItemWithoutAddress, ProductHubProductType } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import type { AaveProductHubItemSeed } from 'handlers/product-hub/update-handlers/aaveV3/aave-v3-products/types'
import { parseLendingProducts } from 'handlers/product-hub/update-handlers/parseLendingProducts'
import { LendingProtocol } from 'lendingProtocols'

const aaveSeed: AaveProductHubItemSeed[] = [
  {
    collateral: 'ETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'ETH',
    debt: 'USDC.E',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wstETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wstETH',
    debt: 'USDC.E',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wBTC',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wBTC',
    debt: 'USDC.E',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'ETH',
    debt: 'DAI',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wstETH',
    debt: 'DAI',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wBTC',
    debt: 'DAI',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wstETH',
    debt: 'ETH',
    strategyType: 'long',
    types: ['borrow', 'earn'],
  },
  {
    collateral: 'DAI',
    debt: 'ETH',
    strategyType: 'short',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'DAI',
    debt: 'wBTC',
    strategyType: 'short',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'USDC',
    debt: 'ETH',
    strategyType: 'short',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'USDC.E',
    debt: 'ETH',
    strategyType: 'short',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'USDC',
    debt: 'wBTC',
    strategyType: 'short',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'USDC.E',
    debt: 'wBTC',
    strategyType: 'short',
    types: ['borrow', 'multiply'],
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
      network: NetworkNames.optimismMainnet,
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
      network: NetworkNames.optimismMainnet,
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
      network: NetworkNames.optimismMainnet,
      protocol: LendingProtocol.AaveV3,
      label: `${strategy.collateral.toUpperCase()}/${strategy.debt.toUpperCase()}`,
      multiplyStrategyType: strategy.strategyType,
      multiplyStrategy:
        strategy.strategyType === 'long' ? `Long ${strategy.collateral}` : `Short ${strategy.debt}`,
    }
  })

const lendingProducts = parseLendingProducts(
  depositTokensList,
  NetworkNames.optimismMainnet,
  LendingProtocol.AaveV3,
)

export const aaveV3OptimimsMainnetProductHubProducts: ProductHubItemWithoutAddress[] = [
  ...borrowProducts,
  ...earnProducts,
  ...multiplyProducts,
  ...lendingProducts,
]
