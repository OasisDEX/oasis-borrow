import BigNumber from 'bignumber.js'
import { ethereumMainnetHexId, NetworkIds, NetworkNames } from 'blockchain/networks'
import {
  AaveBorrowManageComponent,
  AaveManageHeader,
  AaveMultiplyManageComponent,
  AaveOpenHeader,
  AavePositionHeaderNoDetails,
  adjustRiskView,
  DebtInput,
  headerWithDetails,
  ManageSectionComponent,
  SimulateSectionComponent,
} from 'features/aave/components'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from 'features/aave/services'
import { adjustRiskSliders } from 'features/aave/services/riskSliderConfig'
import type { IStrategyConfig } from 'features/aave/types'
import { ProductType, ProxyType, StrategyType } from 'features/aave/types'
import { AaveBorrowFaq } from 'features/content/faqs/aave/borrow'
import { AaveEarnFaqV3 } from 'features/content/faqs/aave/earn'
import { AaveMultiplyFaq } from 'features/content/faqs/aave/multiply'
import { getLocalAppConfig } from 'helpers/config'
import type { AaveLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import { FeaturesEnum } from 'types/config'

import { allActionsAvailableBorrow } from './all-actions-available-borrow'
import { allActionsAvailableInMultiply } from './all-actions-available-in-multiply'
import type { TokenPairConfig } from './common'
import { hasBorrowProductType, hasEarnProductType, hasMultiplyProductType } from './common'

const availableTokenPairs: TokenPairConfig[] = [
  {
    collateral: 'CBETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: FeaturesEnum.AaveV3EarncbETHeth,
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
            action: 'switch-to-earn',
            featureToggle: FeaturesEnum.AaveV3EarncbETHeth,
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
        featureToggle: undefined,
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
            featureToggle: undefined,
          },
        ],
      },
    },
  },
  {
    collateral: 'CBETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Borrow]: {
        featureToggle: undefined,
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
            featureToggle: undefined,
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
    collateral: 'DAI',
    debt: 'WBTC',
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
    collateral: 'ETH',
    debt: 'USDC',
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
    collateral: 'RETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: FeaturesEnum.AaveV3EarnrETHeth,
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
            action: 'switch-to-earn',
            featureToggle: FeaturesEnum.AaveV3EarnrETHeth,
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
    collateral: 'USDC',
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
    collateral: 'USDC',
    debt: 'WBTC',
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
    collateral: 'WBTC',
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
    collateral: 'WBTC',
    debt: 'USDC',
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
    collateral: 'WSTETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
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
            action: 'switch-to-earn',
            featureToggle: undefined,
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
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
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
            action: 'switch-to-earn',
            featureToggle: undefined,
          },
        ],
      },
    },
  },
  {
    collateral: 'SDAI',
    debt: 'LUSD',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
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
            action: 'switch-to-earn',
            featureToggle: undefined,
          },
        ],
      },
    },
  },
  {
    collateral: 'SDAI',
    debt: 'FRAX',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
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
            action: 'switch-to-earn',
            featureToggle: undefined,
          },
        ],
      },
    },
  },
  {
    collateral: 'SDAI',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
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
            action: 'switch-to-earn',
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
      protocol: LendingProtocol.AaveV3 as AaveLendingProtocol,
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
        getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationEthereum],
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
      isOptimizationTabEnabled: () =>
        config.strategyType === StrategyType.Long &&
        getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationEthereum],
    }
  })

const sdaiEarnStrategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasEarnProductType)
  .filter((config) => config.collateral === 'SDAI')
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
      isOptimizationTabEnabled: () =>
        config.strategyType === StrategyType.Long &&
        getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationEthereum],
    }
  })

export const ethereumAaveV3Strategies: IStrategyConfig[] = [
  ...borrowStrategies,
  ...multiplyStategies,
  ...sdaiEarnStrategies,
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'wstETHethV3',
    urlSlug: 'wstetheth',
    proxyType: ProxyType.DpmProxy,
    viewComponents: {
      headerOpen: headerWithDetails(adjustRiskSliders.wstethEth.riskRatios.minimum),
      headerManage: AavePositionHeaderNoDetails,
      headerView: AavePositionHeaderNoDetails,
      simulateSection: SimulateSectionComponent,
      vaultDetailsManage: ManageSectionComponent,
      secondaryInput: adjustRiskView(adjustRiskSliders.wstethEth),
      adjustRiskInput: adjustRiskView(adjustRiskSliders.wstethEth),
      positionInfo: AaveEarnFaqV3,
      sidebarTitle: 'open-earn.aave.vault-form.title',
      sidebarButton: 'open-earn.aave.vault-form.open-btn',
    },
    tokens: {
      collateral: 'WSTETH',
      debt: 'ETH',
      deposit: 'ETH',
    },
    riskRatios: adjustRiskSliders.wstethEth.riskRatios,
    type: ProductType.Earn,
    protocol: LendingProtocol.AaveV3,
    availableActions: () => {
      return [...allActionsAvailableInMultiply, 'switch-to-borrow']
    },
    defaultSlippage: new BigNumber(0.001),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isOptimizationTabEnabled: () => false,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'rethethV3',
    urlSlug: 'retheth',
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
      collateral: 'RETH',
      debt: 'ETH',
      deposit: 'RETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: ProductType.Earn,
    protocol: LendingProtocol.AaveV3,
    featureToggle: FeaturesEnum.AaveV3EarnrETHeth,
    availableActions: () => {
      return [...allActionsAvailableInMultiply, 'switch-to-borrow']
    },
    defaultSlippage: new BigNumber(0.001),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isOptimizationTabEnabled: () => false,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'cbethethV3',
    urlSlug: 'cbetheth',
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
      collateral: 'CBETH',
      debt: 'ETH',
      deposit: 'CBETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: ProductType.Earn,
    protocol: LendingProtocol.AaveV3,
    featureToggle: FeaturesEnum.AaveV3EarncbETHeth,
    availableActions: () => {
      return [...allActionsAvailableInMultiply, 'switch-to-borrow']
    },
    defaultSlippage: new BigNumber(0.001),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isOptimizationTabEnabled: () => false,
  },
]
