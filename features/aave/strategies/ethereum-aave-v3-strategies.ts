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
import { borrowAndMultiply } from 'features/aave/strategies/common-product-types'
import type { IStrategyConfig } from 'features/aave/types'
import { ProductType, ProxyType, StrategyType } from 'features/aave/types'
import { AutomationFeatures } from 'features/automation/common/types'
import { AaveBorrowFaq } from 'features/content/faqs/aave/borrow'
import { AaveEarnFaqV3 } from 'features/content/faqs/aave/earn'
import { AaveMultiplyFaq } from 'features/content/faqs/aave/multiply'
import { SLIPPAGE_YIELD_LOOP } from 'features/userSettings/userSettings.constants'
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
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'CBETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'CBETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'CBETH',
    debt: 'GHO',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'CBETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'DAI',
    debt: 'ETH',
    strategyType: StrategyType.Short,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'DAI',
    debt: 'MKR',
    strategyType: StrategyType.Short,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'DAI',
    debt: 'WBTC',
    strategyType: StrategyType.Short,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'ETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'ETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'LDO',
    debt: 'USDT',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'LINK',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'LINK',
    debt: 'GHO',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'LINK',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'LINK',
    debt: 'USDT',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'LINK',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'MKR',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'RETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'RETH',
    debt: 'GHO',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'RETH',
    debt: 'USDT',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
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
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'USDC',
    debt: 'ETH',
    strategyType: StrategyType.Short,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'USDC',
    debt: 'WBTC',
    strategyType: StrategyType.Short,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'USDC',
    debt: 'GHO',
    strategyType: StrategyType.Short,
    productTypes: {
      ...borrowAndMultiply,
      [ProductType.Earn]: {
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
    collateral: 'USDC',
    debt: 'WSTETH',
    strategyType: StrategyType.Short,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'USDT',
    debt: 'ETH',
    strategyType: StrategyType.Short,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'USDC',
    debt: 'USDT',
    strategyType: StrategyType.Short,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WBTC',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WBTC',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WBTC',
    debt: 'GHO',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WBTC',
    debt: 'LUSD',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WBTC',
    debt: 'USDT',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WBTC',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'ETH',
    debt: 'GHO',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'ETH',
    debt: 'USDT',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'ETH',
    debt: 'WBTC',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WSTETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WSTETH',
    debt: 'CBETH',
    strategyType: StrategyType.Long,
    productTypes: {
      ...borrowAndMultiply,
      [ProductType.Earn]: {
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
    collateral: 'WSTETH',
    debt: 'GHO',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WSTETH',
    debt: 'LUSD',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'WSTETH',
    debt: 'RPL',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
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
    collateral: 'WEETH',
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
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'SDAI',
    debt: 'GHO',
    strategyType: StrategyType.Long,
    productTypes: {
      ...borrowAndMultiply,
      [ProductType.Earn]: {
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
    collateral: 'SDAI',
    debt: 'USDT',
    strategyType: StrategyType.Long,
    productTypes: {
      ...borrowAndMultiply,
      [ProductType.Earn]: {
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
    collateral: 'SDAI',
    debt: 'WBTC',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
  {
    collateral: 'SDAI',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
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
  {
    collateral: 'WSTETH',
    debt: 'USDT',
    strategyType: StrategyType.Long,
    productTypes: borrowAndMultiply,
  },
]

const borrowStrategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasBorrowProductType)
  .map((config): IStrategyConfig => {
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
      isAutomationFeatureEnabled: (feature: AutomationFeatures) => {
        if (feature === AutomationFeatures.STOP_LOSS && config.strategyType === StrategyType.Long) {
          return true
        }
        if (feature === AutomationFeatures.STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3ProtectionLambdaEthereum]
        }
        if (feature === AutomationFeatures.TRAILING_STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3TrailingStopLossLambdaEthereum]
        }

        if (feature === AutomationFeatures.AUTO_BUY || feature === AutomationFeatures.AUTO_SELL) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationEthereum]
        }
        if (feature === AutomationFeatures.PARTIAL_TAKE_PROFIT) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3PartialTakeProfitLambdaEthereum]
        }

        return false
      },
    }
  })

const multiplyStategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasMultiplyProductType)
  .map((config): IStrategyConfig => {
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
      isAutomationFeatureEnabled: (feature: AutomationFeatures) => {
        if (feature === AutomationFeatures.STOP_LOSS && config.strategyType === StrategyType.Long) {
          return true
        }
        if (feature === AutomationFeatures.STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3ProtectionLambdaEthereum]
        }
        if (feature === AutomationFeatures.TRAILING_STOP_LOSS) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3TrailingStopLossLambdaEthereum]
        }
        if (feature === AutomationFeatures.PARTIAL_TAKE_PROFIT) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3PartialTakeProfitLambdaEthereum]
        }

        if (feature === AutomationFeatures.AUTO_BUY || feature === AutomationFeatures.AUTO_SELL) {
          return getLocalAppConfig('features')[FeaturesEnum.AaveV3OptimizationEthereum]
        }

        return false
      },
    }
  })

const sdaiEarnStrategies: IStrategyConfig[] = availableTokenPairs
  .filter(hasEarnProductType)
  .filter((config) => config.collateral === 'SDAI')
  .map((config): IStrategyConfig => {
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
      isAutomationFeatureEnabled: () => {
        return false
      },
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
    defaultSlippage: SLIPPAGE_YIELD_LOOP,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isAutomationFeatureEnabled: (_feature: AutomationFeatures) => false,
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
    availableActions: () => {
      return [...allActionsAvailableInMultiply, 'switch-to-borrow']
    },
    defaultSlippage: SLIPPAGE_YIELD_LOOP,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isAutomationFeatureEnabled: (_feature: AutomationFeatures) => false,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'usdcusdtV3',
    urlSlug: 'usdcusdt',
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
      collateral: 'USDC',
      debt: 'USDT',
      deposit: 'USDC',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: ProductType.Earn,
    protocol: LendingProtocol.AaveV3,
    availableActions: () => {
      return [...allActionsAvailableInMultiply, 'switch-to-borrow']
    },
    defaultSlippage: SLIPPAGE_YIELD_LOOP,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isAutomationFeatureEnabled: (_feature: AutomationFeatures) => false,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'wstethcbethV3',
    urlSlug: 'wstethcbeth',
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
      collateral: 'WSTETH',
      debt: 'CBETH',
      deposit: 'CBETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: ProductType.Earn,
    protocol: LendingProtocol.AaveV3,
    availableActions: () => {
      return [...allActionsAvailableInMultiply, 'switch-to-borrow']
    },
    defaultSlippage: SLIPPAGE_YIELD_LOOP,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isAutomationFeatureEnabled: (_feature: AutomationFeatures) => false,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'usdcghoV3',
    urlSlug: 'usdcgho',
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
      collateral: 'USDC',
      debt: 'GHO',
      deposit: 'GHO',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: ProductType.Earn,
    protocol: LendingProtocol.AaveV3,
    availableActions: () => {
      return [...allActionsAvailableInMultiply, 'switch-to-borrow']
    },
    defaultSlippage: SLIPPAGE_YIELD_LOOP,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isAutomationFeatureEnabled: (_feature: AutomationFeatures) => false,
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
    availableActions: () => {
      return [...allActionsAvailableInMultiply, 'switch-to-borrow']
    },
    defaultSlippage: SLIPPAGE_YIELD_LOOP,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isAutomationFeatureEnabled: (_feature: AutomationFeatures) => false,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'weethethV3',
    urlSlug: 'weetheth',
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
      collateral: 'WEETH',
      debt: 'ETH',
      deposit: 'WEETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: ProductType.Earn,
    protocol: LendingProtocol.AaveV3,
    availableActions: () => {
      return [...allActionsAvailableInMultiply, 'switch-to-borrow']
    },
    defaultSlippage: SLIPPAGE_YIELD_LOOP,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
    isAutomationFeatureEnabled: (_feature: AutomationFeatures) => false,
  },
]
