import { EarnStrategies } from '@prisma/client'
import { NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import { type ProductHubItemWithoutAddress } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import type { AaveProductHubItemSeed } from 'handlers/product-hub/update-handlers/aaveV3/aave-v3-products/types'
import { LendingProtocol } from 'lendingProtocols'

const aaveSeed: AaveProductHubItemSeed[] = [
  {
    collateral: 'ETH',
    debt: 'USDbC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'ETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'WSTETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'WEETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'cbETH',
    debt: 'USDbC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'cbETH',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
  {
    collateral: 'cbETH',
    debt: 'ETH',
    strategyType: 'long',
    types: ['earn'],
  },
  {
    collateral: 'WSTETH',
    debt: 'ETH',
    strategyType: 'long',
    types: ['earn'],
  },
  {
    collateral: 'WEETH',
    debt: 'ETH',
    strategyType: 'long',
    types: ['earn'],
  },
  {
    collateral: 'CBBTC',
    debt: 'USDC',
    strategyType: 'long',
    types: ['borrow', 'multiply'],
  },
]

const borrowProducts = aaveSeed
  .filter((strategy) => strategy.types.includes('borrow'))
  .map((strategy): ProductHubItemWithoutAddress => {
    return {
      product: [OmniProductType.Borrow],
      primaryToken: strategy.collateral.toUpperCase(),
      primaryTokenGroup: getTokenGroup(strategy.collateral.toUpperCase()),
      secondaryToken: strategy.debt.toUpperCase(),
      secondaryTokenGroup: getTokenGroup(strategy.debt.toUpperCase()),
      depositToken: strategy.deposit?.toUpperCase() ?? strategy.collateral.toUpperCase(),
      label: `${strategy.collateral.toUpperCase()}/${strategy.debt.toUpperCase()}`,
      network: NetworkNames.baseMainnet,
      protocol: LendingProtocol.AaveV3,
    }
  })

const earnProducts = aaveSeed
  .filter((strategy) => strategy.types.includes('earn'))
  .map((strategy): ProductHubItemWithoutAddress => {
    return {
      product: [OmniProductType.Earn],
      primaryToken: strategy.collateral.toUpperCase(),
      primaryTokenGroup: getTokenGroup(strategy.collateral.toUpperCase()),
      secondaryToken: strategy.debt.toUpperCase(),
      secondaryTokenGroup: getTokenGroup(strategy.debt.toUpperCase()),
      depositToken: strategy.collateral.toUpperCase(),
      label: `${strategy.collateral.toUpperCase()}/${strategy.debt.toUpperCase()}`,
      network: NetworkNames.baseMainnet,
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
      product: [OmniProductType.Multiply],
      primaryToken: strategy.collateral.toUpperCase(),
      primaryTokenGroup: getTokenGroup(strategy.collateral.toUpperCase()),
      secondaryToken: strategy.debt.toUpperCase(),
      secondaryTokenGroup: getTokenGroup(strategy.debt.toUpperCase()),
      network: NetworkNames.baseMainnet,
      protocol: LendingProtocol.AaveV3,
      label: `${strategy.collateral.toUpperCase()}/${strategy.debt.toUpperCase()}`,
      multiplyStrategyType: strategy.strategyType,
      multiplyStrategy:
        strategy.strategyType === 'long' ? `Long ${strategy.collateral}` : `Short ${strategy.debt}`,
    }
  })

export const aaveV3BaseMainnetProductHubProducts: ProductHubItemWithoutAddress[] = [
  ...borrowProducts,
  ...earnProducts,
  ...multiplyProducts,
]
