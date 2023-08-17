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
import { IStrategyConfig, ProductType, ProxyType, StrategyType } from 'features/aave/types'
import { AaveEarnFaqV3 } from 'features/content/faqs/aave/earn'
import { AaveMultiplyFaq } from 'features/content/faqs/aave/multiply'
import { Feature } from 'helpers/useFeatureToggle'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

import { allActionsAvailableBorrow } from './all-actions-available-borrow'
import { allActionsAvailableInMultiply } from './all-actions-available-in-multiply'

type ProductTypeConfig = {
  featureToggle: Feature | undefined
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Multiply]: {
        featureToggle: 'AaveV3Multiply',
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
      },
      [ProductType.Multiply]: {
        featureToggle: 'AaveV3Multiply',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      },
      [ProductType.Borrow]: {
        featureToggle: 'AaveV3Borrow',
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
      availableActions: allActionsAvailableBorrow,
      executeTransactionWith: 'ethers' as const,
      strategyType: config.strategyType,
    }
  })

// function filterAvailableBorrowActions(pair: tokenPair) {
//   return (action: ManagePositionAvailableActions) => {
//     if (action === 'switch-to-multiply') {
//       return pair.eligiblePositionTypes.includes('Multiply')
//     }
//     if (action === 'switch-to-earn') {
//       return pair.eligiblePositionTypes.includes('Earn')
//     }
//     return true
//   }
// }
//
// function filterAvailableActionsByEligiblePositionTypes(eligiblePositionTypes: ProductType[]) {
//   return (action: ManagePositionAvailableActions) => {
//     if (action === 'switch-to-borrow') {
//       return eligiblePositionTypes.includes('Borrow')
//     }
//     if (action === 'switch-to-earn') {
//       return eligiblePositionTypes.includes('Earn')
//     }
//     if (action === 'switch-to-multiply') {
//       return eligiblePositionTypes.includes('Multiply')
//     }
//     return true
//   }
// }

// export const ethereumAaveV3Strategies: Array<IStrategyConfig> = [
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
      availableActions: allActionsAvailableInMultiply,
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
    availableActions: allActionsAvailableInMultiply,
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
    availableActions: allActionsAvailableInMultiply,
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
    availableActions: allActionsAvailableInMultiply,
    defaultSlippage: new BigNumber(0.001),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
]
