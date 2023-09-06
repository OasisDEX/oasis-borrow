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
import { allActionsAvailableBorrow } from 'features/aave/strategies/all-actions-available-borrow'
import { allActionsAvailableInMultiply } from 'features/aave/strategies/all-actions-available-in-multiply'
import {
  hasBorrowProductType,
  hasEarnProductType,
  hasMultiplyProductType,
  TokenPairConfig,
} from 'features/aave/strategies/common'
import { IStrategyConfig, ProductType, ProxyType, StrategyType } from 'features/aave/types'
import { AaveBorrowFaq } from 'features/content/faqs/aave/borrow'
import { AaveMultiplyFaq } from 'features/content/faqs/aave/multiply'
import { getFeatureToggle } from 'helpers/useFeatureToggle'
import { LendingProtocol } from 'lendingProtocols'

const availableTokenPairs: TokenPairConfig[] = [
  {
    collateral: 'WSTETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Multiply]: {
        featureToggle: 'SparkProtocolMultiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'SparkProtocolMultiply',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'SparkProtocolBorrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'SparkProtocolBorrow',
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
        featureToggle: 'SparkProtocolMultiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'SparkProtocolMultiply',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'SparkProtocolBorrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'SparkProtocolBorrow',
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
        featureToggle: 'SparkProtocolMultiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'SparkProtocolMultiply',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'SparkProtocolBorrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'SparkProtocolBorrow',
          },
        ],
      },
    },
  },
  {
    collateral: 'SDAI',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Multiply]: {
        featureToggle: 'SparkProtocolMultiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'SparkProtocolMultiply',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'SparkProtocolBorrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'SparkProtocolBorrow',
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
        featureToggle: 'SparkProtocolEarn',
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
        featureToggle: 'SparkProtocolEarn',
        additionalManageActions: [],
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
        vaultDetailsView: AaveBorrowManageComponent,
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
      protocol: LendingProtocol.SparkV3,
      availableActions: () => {
        const additionalAction =
          config.productTypes.Borrow.additionalManageActions
            ?.filter(({ featureToggle }) => {
              const isFeatureEnabled =
                featureToggle === undefined || getFeatureToggle(featureToggle)

              return isFeatureEnabled
            })
            .map(({ action }) => action) ?? []

        return [...allActionsAvailableBorrow, ...additionalAction]
      },
      executeTransactionWith: 'ethers' as const,
      strategyType: config.strategyType,
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
        vaultDetailsView: AaveMultiplyManageComponent,
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
      protocol: LendingProtocol.SparkV3,
      availableActions: () => {
        const additionalAction =
          config.productTypes.Multiply.additionalManageActions
            ?.filter(({ featureToggle }) => {
              const isFeatureEnabled =
                featureToggle === undefined || getFeatureToggle(featureToggle)

              return isFeatureEnabled
            })
            .map(({ action }) => action) ?? []

        return [...allActionsAvailableInMultiply, ...additionalAction]
      },
      executeTransactionWith: 'ethers',
      strategyType: config.strategyType,
      featureToggle: config.productTypes.Multiply.featureToggle,
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
        vaultDetailsView: AaveMultiplyManageComponent,
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
      protocol: LendingProtocol.SparkV3,
      availableActions: () => {
        const additionalAction =
          config.productTypes.Earn.additionalManageActions
            ?.filter(({ featureToggle }) => {
              const isFeatureEnabled =
                featureToggle === undefined || getFeatureToggle(featureToggle)

              return isFeatureEnabled
            })
            .map(({ action }) => action) ?? []

        return [...allActionsAvailableInMultiply, ...additionalAction]
      },
      executeTransactionWith: 'ethers',
      strategyType: config.strategyType,
      featureToggle: config.productTypes.Earn.featureToggle,
    }
  })

export const ethereumSparkV3Strategies: IStrategyConfig[] = [
  ...borrowStrategies,
  ...multiplyStategies,
  ...earnStrategies,
]
