import { EarnStrategies } from '@prisma/client'
import { NetworkNames } from 'blockchain/networks'
import type { ProductHubItemWithoutAddress } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

import type { AaveProductHubItemSeed } from './aave-product-hub-item-seed'

const aaveSeed: AaveProductHubItemSeed[] = [
  {
    collateral: 'ETH',
    debt: 'USDC',
    group: 'ETH',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wstETH',
    debt: 'USDC',
    group: 'ETH',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wBTC',
    debt: 'USDC',
    group: 'BTC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'ETH',
    debt: 'DAI',
    group: 'ETH',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wstETH',
    debt: 'DAI',
    group: 'ETH',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wBTC',
    debt: 'DAI',
    group: 'BTC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'wstETH',
    debt: 'ETH',
    group: 'ETH',
    strategyType: 'long',
    types: ['borrow', 'earn'],
  },
  {
    collateral: 'DAI',
    debt: 'ETH',
    group: 'ETH',
    strategyType: 'short',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'DAI',
    debt: 'wBTC',
    group: 'BTC',
    strategyType: 'short',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'USDC',
    debt: 'ETH',
    group: 'ETH',
    strategyType: 'short',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'USDC',
    debt: 'wBTC',
    group: 'BTC',
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
      primaryTokenGroup: strategy.group.toUpperCase(),
      secondaryToken: strategy.debt.toUpperCase(),
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
      primaryTokenGroup: strategy.group.toUpperCase(),
      secondaryToken: strategy.debt.toUpperCase(),
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
      primaryTokenGroup: strategy.group.toUpperCase(),
      secondaryToken: strategy.debt.toUpperCase(),
      network: NetworkNames.optimismMainnet,
      protocol: LendingProtocol.AaveV3,
      label: `${strategy.collateral.toUpperCase()}/${strategy.debt.toUpperCase()}`,
      multiplyStrategyType: strategy.strategyType,
      multiplyStrategy:
        strategy.strategyType === 'long' ? `Long ${strategy.collateral}` : `Short ${strategy.debt}`,
    }
  })

export const aaveV3OptimimsMainnetProductHubProducts: ProductHubItemWithoutAddress[] = [
  ...borrowProducts,
  ...earnProducts,
  ...multiplyProducts,
]
