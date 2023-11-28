import BigNumber from 'bignumber.js'
import { ethereumMainnetHexId, NetworkIds, NetworkNames } from 'blockchain/networks'
import {
  AaveBorrowManageComponent,
  AaveManageHeader,
  AaveMultiplyManageComponent,
  AaveOpenHeader,
  adjustRiskView,
  DebtInput,
} from 'features/aave/components'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from 'features/aave/services'
import type { IStrategyConfig } from 'features/aave/types'
import { ProductType, ProxyType, StrategyType } from 'features/aave/types'
import { SparkBorrowFaq } from 'features/content/faqs/spark/borrow'
import { SparkEarnFaqV3 } from 'features/content/faqs/spark/earn'
import { SparkMultiplyFaq } from 'features/content/faqs/spark/multiply'
import { getLocalAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import { FeaturesEnum } from 'types/config'

import { allActionsAvailableBorrow } from './all-actions-available-borrow'
import { allActionsAvailableInMultiply } from './all-actions-available-in-multiply'
import type { TokenPairConfig } from './common'
import { hasBorrowProductType, hasEarnProductType, hasMultiplyProductType } from './common'

const availableTokenPairs: TokenPairConfig[] = [
  {
    collateral: 'WSTETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
    },
  },
  {
    collateral: 'RETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
    },
  },
  {
    collateral: 'ETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
    },
  },
  {
    collateral: 'SDAI',
    debt: 'ETH',
    strategyType: StrategyType.Short,
    productTypes: {
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
    },
  },
  {
    collateral: 'WSTETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: undefined,
        additionalManageActions: [],
      },
    },
  },
  {
    collateral: 'RETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: undefined,
        additionalManageActions: [],
      },
    },
  },
  {
    collateral: 'SDAI',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: undefined,
        additionalManageActions: [],
        defaultSlippage: new BigNumber(0.001),
      },
    },
  },
  {
    collateral: 'SDAI',
    debt: 'USDT',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: undefined,
        additionalManageActions: [],
        defaultSlippage: new BigNumber(0.001),
      },
    },
  },
  {
    collateral: 'WBTC',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Multiply]: {
        featureToggle: FeaturesEnum.SparkWBTCDAI,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.SparkWBTCDAI,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
    },
  },
]

const borrowStrategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasBorrowProductType)
  .map((config) => {
    return {
      network: NetworkNames.ethereumMainnet,
      networkId: NetworkIds.MAINNET,
      networkHexId: ethereumMainnetHexId,
      name: `${config.collateral.toLowerCase()}${config.debt.toLowerCase()}V3`,
      urlSlug: `${config.collateral.toLowerCase()}${config.debt.toLowerCase()}`,
      proxyType: ProxyType.DpmProxy,
      viewComponents: {
        headerOpen: AaveOpenHeader,
        headerManage: AaveManageHeader,
        headerView: AaveManageHeader,
        simulateSection: AaveBorrowManageComponent,
        vaultDetailsManage: AaveBorrowManageComponent,
        secondaryInput: DebtInput,
        adjustRiskInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
        positionInfo: SparkBorrowFaq,
        sidebarTitle: 'open-borrow.sidebar.title',
        sidebarButton: 'open-borrow.sidebar.open-btn',
      },
      tokens: {
        collateral: config.collateral,
        debt: config.debt,
        deposit: config.collateral,
      },
      riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
      featureToggle: config.productTypes.Borrow.featureToggle,
      type: ProductType.Borrow,
      protocol: LendingProtocol.SparkV3,
      availableActions: () => {
        const additionalAction =
          config.productTypes.Borrow.additionalManageActions
            ?.filter(({ featureToggle }) => {
              const isFeatureEnabled =
                featureToggle === undefined || getLocalAppConfig('features')[featureToggle]
              return isFeatureEnabled
            })
            .map(({ action }) => action) ?? []
        return [...allActionsAvailableBorrow, ...additionalAction]
      },
      executeTransactionWith: 'ethers' as const,
      strategyType: config.strategyType,
      isOptimizationTabEnabled: () =>
        config.strategyType === StrategyType.Long &&
        getLocalAppConfig('features')[FeaturesEnum.SparkOptimization],
    }
  })

const multiplyStategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasMultiplyProductType)
  .map((config) => {
    return {
      network: NetworkNames.ethereumMainnet,
      networkId: NetworkIds.MAINNET,
      networkHexId: ethereumMainnetHexId,
      name: `${config.collateral.toLowerCase()}${config.debt.toLowerCase()}V3`,
      urlSlug: `${config.collateral.toLowerCase()}${config.debt.toLowerCase()}`,
      proxyType: ProxyType.DpmProxy,
      viewComponents: {
        headerOpen: AaveOpenHeader,
        headerManage: AaveManageHeader,
        headerView: AaveManageHeader,
        simulateSection: AaveMultiplyManageComponent,
        vaultDetailsManage: AaveMultiplyManageComponent,
        secondaryInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
        adjustRiskInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
        positionInfo: SparkMultiplyFaq,
        sidebarTitle: 'open-multiply.sidebar.title',
        sidebarButton: 'open-multiply.sidebar.open-btn',
      },
      tokens: {
        collateral: config.collateral,
        debt: config.debt,
        deposit: config.collateral,
      },
      riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
      type: ProductType.Multiply,
      protocol: LendingProtocol.SparkV3,
      availableActions: () => {
        const additionalAction =
          config.productTypes.Multiply.additionalManageActions
            ?.filter(({ featureToggle }) => {
              const isFeatureEnabled =
                featureToggle === undefined || getLocalAppConfig('features')[featureToggle]
              return isFeatureEnabled
            })
            .map(({ action }) => action) ?? []
        return [...allActionsAvailableInMultiply, ...additionalAction]
      },
      executeTransactionWith: 'ethers',
      strategyType: config.strategyType,
      featureToggle: config.productTypes.Multiply.featureToggle,
      isOptimizationTabEnabled: () =>
        config.strategyType === StrategyType.Long &&
        getLocalAppConfig('features')[FeaturesEnum.SparkOptimization],
    }
  })

const earnStrategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasEarnProductType)
  .map((config) => {
    return {
      network: NetworkNames.ethereumMainnet,
      networkId: NetworkIds.MAINNET,
      networkHexId: ethereumMainnetHexId,
      name: `${config.collateral.toLowerCase()}${config.debt.toLowerCase()}V3`,
      urlSlug: `${config.collateral.toLowerCase()}${config.debt.toLowerCase()}`,
      proxyType: ProxyType.DpmProxy,
      viewComponents: {
        headerOpen: AaveOpenHeader,
        headerManage: AaveManageHeader,
        headerView: AaveManageHeader,
        simulateSection: AaveMultiplyManageComponent,
        vaultDetailsManage: AaveMultiplyManageComponent,
        secondaryInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
        adjustRiskInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
        positionInfo: SparkEarnFaqV3,
        sidebarTitle: 'open-multiply.sidebar.title',
        sidebarButton: 'open-multiply.sidebar.open-btn',
      },
      tokens: {
        collateral: config.collateral,
        debt: config.debt,
        deposit: config.collateral,
      },
      riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
      type: ProductType.Earn,
      protocol: LendingProtocol.SparkV3,
      availableActions: () => {
        const additionalAction =
          config.productTypes.Earn.additionalManageActions
            ?.filter(({ featureToggle }) => {
              const isFeatureEnabled =
                featureToggle === undefined || getLocalAppConfig('features')[featureToggle]
              return isFeatureEnabled
            })
            .map(({ action }) => action) ?? []
        return [...allActionsAvailableInMultiply, ...additionalAction]
      },
      executeTransactionWith: 'ethers',
      defaultSlippage: config.productTypes.Earn.defaultSlippage,
      strategyType: config.strategyType,
      featureToggle: config.productTypes.Earn.featureToggle,
      isOptimizationTabEnabled: () =>
        config.strategyType === StrategyType.Long &&
        getLocalAppConfig('features')[FeaturesEnum.SparkOptimization],
    }
  })

export const ethereumSparkV3Strategies: IStrategyConfig[] = [
  ...borrowStrategies,
  ...multiplyStategies,
  ...earnStrategies,
]
