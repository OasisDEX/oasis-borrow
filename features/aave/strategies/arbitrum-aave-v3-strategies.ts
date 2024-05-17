import { arbitrumMainnetHexId, NetworkIds, NetworkNames } from 'blockchain/networks'
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
import { AutomationFeatures } from 'features/automation/common/types'
import { AaveBorrowFaq } from 'features/content/faqs/aave/borrow'
import { AaveMultiplyFaq } from 'features/content/faqs/aave/multiply'
import { getLocalAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import { FeaturesEnum } from 'types/config'

import { allActionsAvailableBorrow } from './all-actions-available-borrow'
import { allActionsAvailableInMultiply } from './all-actions-available-in-multiply'
import type { TokenPairConfig } from './common'
import { hasBorrowProductType, hasEarnProductType, hasMultiplyProductType } from './common'

const availableTokenPairs: TokenPairConfig[] = [
  {
    collateral: 'ETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
    },
  },
  {
    collateral: 'WSTETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
    },
  },
  {
    collateral: 'WBTC',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
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
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
    },
  },
  {
    collateral: 'WSTETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
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
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
    },
  },
  {
    collateral: 'RETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
    },
  },
  {
    collateral: 'WBTC',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
    },
  },
  {
    collateral: 'RETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumEarn,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-earn',
            featureToggle: FeaturesEnum.AaveV3ArbitrumEarn,
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
        featureToggle: FeaturesEnum.AaveV3ArbitrumEarn,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-earn',
            featureToggle: FeaturesEnum.AaveV3ArbitrumEarn,
          },
        ],
      },
    },
  },
  {
    collateral: 'WEETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumEarn,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-earn',
            featureToggle: FeaturesEnum.AaveV3ArbitrumEarn,
          },
        ],
      },
    },
  },
  {
    collateral: 'DAI',
    debt: 'ETH',
    strategyType: StrategyType.Short,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
    },
  },
  {
    collateral: 'DAI',
    debt: 'WBTC',
    strategyType: StrategyType.Short,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
    },
  },
  {
    collateral: 'USDC',
    debt: 'ETH',
    strategyType: StrategyType.Short,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
          },
        ],
      },
    },
  },
  {
    collateral: 'USDC',
    debt: 'WBTC',
    strategyType: StrategyType.Short,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: undefined,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: undefined,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.AaveV3ArbitrumBorrow,
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
      network: NetworkNames.arbitrumMainnet,
      networkId: NetworkIds.ARBITRUMMAINNET,
      networkHexId: arbitrumMainnetHexId,
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
        positionInfo: AaveBorrowFaq,
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
      protocol: LendingProtocol.AaveV3,
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
      isAutomationFeatureEnabled: (feature: AutomationFeatures) => {
        if (feature === AutomationFeatures.AUTO_BUY || feature === AutomationFeatures.AUTO_SELL) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationArbitrum]
        }
        if (feature === AutomationFeatures.STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3ProtectionLambdaArbitrum]
        }
        if (feature === AutomationFeatures.TRAILING_STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3TrailingStopLossLambdaArbitrum]
        }
        if (feature === AutomationFeatures.PARTIAL_TAKE_PROFIT) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3PartialTakeProfitLambdaArbitrum]
        }
        return false
      },
    }
  })

const multiplyStategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasMultiplyProductType)
  .map((config) => {
    return {
      network: NetworkNames.arbitrumMainnet,
      networkId: NetworkIds.ARBITRUMMAINNET,
      networkHexId: arbitrumMainnetHexId,
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
        positionInfo: AaveMultiplyFaq,
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
      protocol: LendingProtocol.AaveV3,
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
      isAutomationFeatureEnabled: (feature: AutomationFeatures) => {
        if (feature === AutomationFeatures.AUTO_BUY || feature === AutomationFeatures.AUTO_SELL) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationArbitrum]
        }
        if (feature === AutomationFeatures.STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3ProtectionLambdaArbitrum]
        }
        if (feature === AutomationFeatures.TRAILING_STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3TrailingStopLossLambdaArbitrum]
        }
        if (feature === AutomationFeatures.PARTIAL_TAKE_PROFIT) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3PartialTakeProfitLambdaArbitrum]
        }
        return false
      },
    }
  })

const earnStrategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasEarnProductType)
  .map((config) => {
    return {
      network: NetworkNames.arbitrumMainnet,
      networkId: NetworkIds.ARBITRUMMAINNET,
      networkHexId: arbitrumMainnetHexId,
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
        positionInfo: AaveMultiplyFaq,
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
      protocol: LendingProtocol.AaveV3,
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
      strategyType: config.strategyType,
      featureToggle: config.productTypes.Earn.featureToggle,
      isAutomationFeatureEnabled: (feature: AutomationFeatures) => {
        if (feature === AutomationFeatures.AUTO_BUY || feature === AutomationFeatures.AUTO_SELL) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationArbitrum]
        }
        if (feature === AutomationFeatures.PARTIAL_TAKE_PROFIT) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3PartialTakeProfitLambdaArbitrum]
        }
        return false
      },
    }
  })

export const arbitrumAaveV3Strategies: Array<IStrategyConfig> = [
  ...borrowStrategies,
  ...multiplyStategies,
  ...earnStrategies,
]
