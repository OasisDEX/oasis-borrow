import { baseMainnetHexId, NetworkIds, NetworkNames } from 'blockchain/networks'
import {
  AaveBorrowManageComponent,
  AaveManageHeader,
  AaveOpenHeader,
  adjustRiskView,
  DebtInput,
} from 'features/aave/components'
import { AaveMultiplyManageComponent } from 'features/aave/components/AaveMultiplyManageComponent'
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
    collateral: 'CBETH',
    debt: 'USDBC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.BaseNetworkEnabled,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: FeaturesEnum.BaseNetworkEnabled,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: FeaturesEnum.BaseNetworkEnabled,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.BaseNetworkEnabled,
          },
        ],
      },
    },
  },
  {
    collateral: 'CBETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.BaseNetworkEnabled,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: FeaturesEnum.BaseNetworkEnabled,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: FeaturesEnum.BaseNetworkEnabled,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.BaseNetworkEnabled,
          },
        ],
      },
    },
  },
  {
    collateral: 'ETH',
    debt: 'USDBC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.BaseNetworkEnabled,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: FeaturesEnum.BaseNetworkEnabled,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: FeaturesEnum.BaseNetworkEnabled,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.BaseNetworkEnabled,
          },
        ],
      },
    },
  },
  {
    collateral: 'ETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: FeaturesEnum.BaseNetworkEnabled,
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: FeaturesEnum.BaseNetworkEnabled,
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: FeaturesEnum.BaseNetworkEnabled,
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: FeaturesEnum.BaseNetworkEnabled,
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
        [ProductType.Borrow]: {
          featureToggle: FeaturesEnum.BaseNetworkEnabled,
          additionalManageActions: [
            {
              action: 'switch-to-earn',
              featureToggle: FeaturesEnum.BaseNetworkEnabled,
            },
          ],
        },
        [ProductType.Earn]: {
          featureToggle: FeaturesEnum.BaseNetworkEnabled,
          additionalManageActions: [
            {
              action: 'switch-to-borrow',
              featureToggle: FeaturesEnum.BaseNetworkEnabled,
            },
          ],
        },
      },
  },
  {
    collateral: 'CBETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: FeaturesEnum.BaseNetworkEnabled,
        additionalManageActions: [],
      },
    },
  },
]

const borrowStrategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasBorrowProductType)
  .map((config) => {
    return {
      network: NetworkNames.baseMainnet,
      networkId: NetworkIds.BASEMAINNET,
      networkHexId: baseMainnetHexId,
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
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationBase]
        }
        if (feature === AutomationFeatures.STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3ProtectionLambdaBase]
        }
        if (feature === AutomationFeatures.TRAILING_STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3TrailingStopLossLambdaBase]
        }
        if (feature === AutomationFeatures.PARTIAL_TAKE_PROFIT) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3PartialTakeProfitLambdaBase]
        }
        return false
      },
    }
  })

const multiplyStategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasMultiplyProductType)
  .map((config) => {
    return {
      network: NetworkNames.baseMainnet,
      networkId: NetworkIds.BASEMAINNET,
      networkHexId: baseMainnetHexId,
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
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationBase]
        }
        if (feature === AutomationFeatures.STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3ProtectionLambdaBase]
        }
        if (feature === AutomationFeatures.TRAILING_STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3TrailingStopLossLambdaBase]
        }
        if (feature === AutomationFeatures.PARTIAL_TAKE_PROFIT) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3PartialTakeProfitLambdaBase]
        }
        return false
      },
    }
  })

const earnStrategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasEarnProductType)
  .map((config) => {
    return {
      network: NetworkNames.baseMainnet,
      networkId: NetworkIds.BASEMAINNET,
      networkHexId: baseMainnetHexId,
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
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationBase]
        }
        if (feature === AutomationFeatures.PARTIAL_TAKE_PROFIT) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3PartialTakeProfitLambdaBase]
        }
        return false
      },
    }
  })

export const baseAaveV3Strategies: Array<IStrategyConfig> = [
  ...borrowStrategies,
  ...multiplyStategies,
  ...earnStrategies,
]
