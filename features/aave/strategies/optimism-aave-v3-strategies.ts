import { NetworkIds, NetworkNames, optimismMainnetHexId } from 'blockchain/networks'
import { AaveManageHeader, AaveOpenHeader, adjustRiskView } from 'features/aave/components'
import { AaveMultiplyManageComponent } from 'features/aave/components/AaveMultiplyManageComponent'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from 'features/aave/services'
import { IStrategyConfig, ProductType, ProxyType, StrategyType } from 'features/aave/types'
import { AaveMultiplyFaq } from 'features/content/faqs/aave/multiply'
import { LendingProtocol } from 'lendingProtocols'

import { allActionsAvailableInMultiply } from './all-actions-available-in-multiply'

export const optimismAaveV3Strategies: Array<IStrategyConfig> = [
  {
    network: NetworkNames.optimismMainnet,
    networkId: NetworkIds.OPTIMISMMAINNET,
    networkHexId: optimismMainnetHexId,
    name: 'optimism-ethusdc',
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
    type: ProductType.Multiply,
    protocol: LendingProtocol.AaveV3,
    availableActions: allActionsAvailableInMultiply,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
  {
    network: NetworkNames.optimismMainnet,
    networkId: NetworkIds.OPTIMISMMAINNET,
    networkHexId: optimismMainnetHexId,
    name: 'optimism-wstethusdc',
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
    type: ProductType.Multiply,
    protocol: LendingProtocol.AaveV3,
    availableActions: allActionsAvailableInMultiply,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
  {
    network: NetworkNames.optimismMainnet,
    networkId: NetworkIds.OPTIMISMMAINNET,
    networkHexId: optimismMainnetHexId,
    name: 'optimism-wbtcusdc',
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
    type: ProductType.Multiply,
    protocol: LendingProtocol.AaveV3,
    availableActions: allActionsAvailableInMultiply,
    executeTransactionWith: 'ethers',
    strategyType: StrategyType.Long,
  },
]
