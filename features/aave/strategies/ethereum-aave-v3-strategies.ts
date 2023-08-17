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
  ViewPositionSectionComponent,
} from 'features/aave/components'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from 'features/aave/services'
import { adjustRiskSliders } from 'features/aave/services/riskSliderConfig'
import {
  IStrategyConfig,
  ManagePositionAvailableActions,
  ProductType,
  ProxyType,
  StrategyType,
} from 'features/aave/types'
import { AaveEarnFaqV3 } from 'features/content/faqs/aave/earn'
import { AaveMultiplyFaq } from 'features/content/faqs/aave/multiply'
import { Feature, getFeatureToggle } from 'helpers/useFeatureToggle'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

import { allActionsAvailableBorrow } from './all-actions-available-borrow'
import { allActionsAvailableInMultiply } from './all-actions-available-in-multiply'

type ProductTypeConfig = {
  featureToggle: Feature | undefined
  additionalManageActions?: {
    action: ManagePositionAvailableActions
    featureToggle: Feature | undefined
  }[]
}

type TokenPairConfig = {
  collateral: string
  debt: string
  strategyType: StrategyType
  productTypes: Partial<Record<ProductType, ProductTypeConfig>>
}

function hasMultiplyProductType(
  config: TokenPairConfig,
): config is TokenPairConfig & { productTypes: { [ProductType.Multiply]: ProductTypeConfig } } {
  return config.productTypes.Multiply !== undefined
}

function hasBorrowProductType(
  config: TokenPairConfig,
): config is TokenPairConfig & { productTypes: { [ProductType.Borrow]: ProductTypeConfig } } {
  return config.productTypes.Borrow !== undefined
}

const availableTokenPairs: TokenPairConfig[] = [
  {
    collateral: 'CBETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    productTypes: {
      [ProductType.Earn]: {
        featureToggle: 'AaveV3EarncbETHeth',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-earn',
            featureToggle: 'AaveV3EarncbETHeth',
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
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
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
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
          },
        ],
      },
      [ProductType.Multiply]: {
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
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
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
        featureToggle: 'AaveV3EarnrETHeth',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-earn',
            featureToggle: 'AaveV3EarnrETHeth',
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
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
    debt: 'WSTETH',
    strategyType: StrategyType.Short,
    productTypes: {
      [ProductType.Multiply]: {
        featureToggle: 'AaveV3Multiply',
        additionalManageActions: [
          {
            action: 'switch-to-borrow',
            featureToggle: 'AaveV3Borrow',
          },
        ],
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
        additionalManageActions: [
          {
            action: 'switch-to-multiply',
            featureToggle: 'AaveV3Multiply',
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
        vaultDetailsView: AaveBorrowManageComponent,
        secondaryInput: DebtInput,
        adjustRiskInput: adjustRiskView(multiplyAdjustRiskSliderConfig),
        positionInfo: AaveMultiplyFaq,
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
      protocol: LendingProtocol.AaveV3,
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

export const ethereumAaveV3Strategies: IStrategyConfig[] = [
  ...borrowStrategies,
  ...multiplyStategies,
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
      vaultDetailsView: ViewPositionSectionComponent,
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
      const isBorrowEnabled = getFeatureToggle('AaveV3Borrow')
      const additionalActions: ManagePositionAvailableActions[] = isBorrowEnabled
        ? ['switch-to-borrow']
        : []
      return [...allActionsAvailableInMultiply, ...additionalActions]
    },
    defaultSlippage: new BigNumber(0.001),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
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
      vaultDetailsView: AaveMultiplyManageComponent,
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
    featureToggle: 'AaveV3EarnrETHeth',
    availableActions: () => {
      const isBorrowEnabled = getFeatureToggle('AaveV3Borrow')
      const additionalActions: ManagePositionAvailableActions[] = isBorrowEnabled
        ? ['switch-to-borrow']
        : []
      return [...allActionsAvailableInMultiply, ...additionalActions]
    },
    defaultSlippage: new BigNumber(0.001),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
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
      vaultDetailsView: AaveMultiplyManageComponent,
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
    featureToggle: 'AaveV3EarncbETHeth',
    availableActions: () => {
      const isBorrowEnabled = getFeatureToggle('AaveV3Borrow')
      const additionalActions: ManagePositionAvailableActions[] = isBorrowEnabled
        ? ['switch-to-borrow']
        : []
      return [...allActionsAvailableInMultiply, ...additionalActions]
    },
    defaultSlippage: new BigNumber(0.001),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
]
