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
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

import { allActionsAvailableBorrow } from './all-actions-available-borrow'
import { allActionsAvailableInMultiply } from './all-actions-available-in-multiply'

type tokenPair = {
  collateral: string
  debt: string
  strategyType: StrategyType
  eligiblePositionTypes: ProductType[]
}

const availableTokenPairs: tokenPair[] = [
  {
    collateral: 'CBETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow', 'Earn'],
  },
  {
    collateral: 'DAI',
    debt: 'ETH',
    strategyType: StrategyType.Short,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
  {
    collateral: 'DAI',
    debt: 'WBTC',
    strategyType: StrategyType.Short,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
  {
    collateral: 'ETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
  {
    collateral: 'ETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
  {
    collateral: 'RETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow'],
  },
  {
    collateral: 'RETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow'],
  },
  {
    collateral: 'RETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow'],
  },
  {
    collateral: 'USDC',
    debt: 'ETH',
    strategyType: StrategyType.Short,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
  {
    collateral: 'USDC',
    debt: 'WBTC',
    strategyType: StrategyType.Short,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
  {
    collateral: 'WBTC',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
  {
    collateral: 'WBTC',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
  {
    collateral: 'WSTETH',
    debt: 'DAI',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
  {
    collateral: 'WSTETH',
    debt: 'ETH',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow', 'Earn'],
  },
  {
    collateral: 'WSTETH',
    debt: 'USDC',
    strategyType: StrategyType.Long,
    eligiblePositionTypes: ['Borrow', 'Multiply'],
  },
]

const borrowStrategies = availableTokenPairs.map((pair) => {
  return {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: `${pair.collateral.toLowerCase()}${pair.debt.toLowerCase()}V3`,
    urlSlug: `${pair.collateral.toLowerCase()}${pair.debt.toLowerCase()}`,
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
      collateral: pair.collateral,
      debt: pair.debt,
      deposit: pair.collateral,
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    featureToggle: 'AaveV3Borrow' as const,
    type: 'Borrow' as ProductType,
    protocol: LendingProtocol.AaveV3 as AaveLendingProtocol,
    availableActions: allActionsAvailableBorrow.filter(filterAvailableBorrowActions(pair)),
    executeTransactionWith: 'ethers' as const,
    strategyType: pair.strategyType,
  }
})

function filterAvailableBorrowActions(pair: tokenPair) {
  return (action: ManagePositionAvailableActions) => {
    if (action === 'switch-to-multiply') {
      return pair.eligiblePositionTypes.includes('Multiply')
    }
    if (action === 'switch-to-earn') {
      return pair.eligiblePositionTypes.includes('Earn')
    }
    return true
  }
}

function filterAvailableActionsByEligiblePositionTypes(eligiblePositionTypes: ProductType[]) {
  return (action: ManagePositionAvailableActions) => {
    if (action === 'switch-to-borrow') {
      return eligiblePositionTypes.includes('Borrow')
    }
    if (action === 'switch-to-earn') {
      return eligiblePositionTypes.includes('Earn')
    }
    if (action === 'switch-to-multiply') {
      return eligiblePositionTypes.includes('Multiply')
    }
    return true
  }
}

export const ethereumAaveV3Strategies: Array<IStrategyConfig> = [
  ...borrowStrategies,
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
    type: 'Earn',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3EarnWSTETH',
    availableActions: allActionsAvailableInMultiply.filter(
      filterAvailableActionsByEligiblePositionTypes(['Borrow', 'Earn']),
    ),
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
    type: 'Multiply',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3EarnrETHeth',
    availableActions: allActionsAvailableInMultiply.filter(
      filterAvailableActionsByEligiblePositionTypes(['Borrow', 'Multiply']),
    ),
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
    type: 'Multiply',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3EarncbETHeth',
    availableActions: allActionsAvailableInMultiply.filter(
      filterAvailableActionsByEligiblePositionTypes(['Borrow', 'Multiply']),
    ),
    defaultSlippage: new BigNumber(0.001),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'ethusdcV3',
    urlSlug: 'ethusdc',
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
      collateral: 'ETH',
      debt: 'USDC',
      deposit: 'ETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: 'Multiply',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3MultiplyETHusdc',
    availableActions: allActionsAvailableInMultiply.filter(
      filterAvailableActionsByEligiblePositionTypes(['Borrow', 'Multiply']),
    ),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'cbETHusdcV3',
    urlSlug: 'cbethusdc',
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
      debt: 'USDC',
      deposit: 'CBETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: 'Multiply',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3MultiplycbETHusdc',
    availableActions: allActionsAvailableInMultiply.filter(
      filterAvailableActionsByEligiblePositionTypes(['Borrow', 'Multiply']),
    ),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'wBTCusdcV3',
    urlSlug: 'wbtcusdc',
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
      collateral: 'WBTC',
      debt: 'USDC',
      deposit: 'WBTC',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: 'Multiply',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3MultiplywBTCusdc',
    availableActions: allActionsAvailableInMultiply.filter(
      filterAvailableActionsByEligiblePositionTypes(['Borrow', 'Multiply']),
    ),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'wstethusdcV3',
    urlSlug: 'wstethusdc',
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
      collateral: 'WSTETH',
      debt: 'USDC',
      deposit: 'WSTETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: 'Multiply',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3MultiplywstETHusdc',
    availableActions: allActionsAvailableInMultiply.filter(
      filterAvailableActionsByEligiblePositionTypes(['Borrow', 'Multiply']),
    ),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    networkHexId: ethereumMainnetHexId,
    name: 'rethusdcV3',
    urlSlug: 'rethusdc',
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
      debt: 'USDC',
      deposit: 'RETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: 'Multiply',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3MultiplyrETHusdc',
    availableActions: allActionsAvailableInMultiply.filter(
      filterAvailableActionsByEligiblePositionTypes(['Borrow', 'Multiply']),
    ),
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
]
