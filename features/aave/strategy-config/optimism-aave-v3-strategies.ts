import { NetworkIds, NetworkNames, optimismMainnetHexId } from 'blockchain/networks'
import { IStrategyConfig, ProxyType } from 'features/aave/common'
import { AaveManageHeader, AaveOpenHeader } from 'features/aave/common/components/AaveHeader'
import { adjustRiskView } from 'features/aave/common/components/SidebarAdjustRiskView'
import { AaveMultiplyFaq } from 'features/content/faqs/aave/multiply'
import { AaveMultiplyManageComponent } from 'features/multiply/aave/components/AaveMultiplyManageComponent'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from 'features/multiply/aave/riskSliderConfig'
import { LendingProtocol } from 'lendingProtocols'

import { allActionsAvailable } from './all-actions-available'

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
    featureToggle: 'AaveV3Optimism',
    availableActions: allActionsAvailable,
    executeTransactionWith: 'ethers',
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
    featureToggle: 'AaveV3Optimism',
    availableActions: allActionsAvailable,
    executeTransactionWith: 'ethers',
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
    featureToggle: 'AaveV3Optimism',
    availableActions: allActionsAvailable,
    executeTransactionWith: 'ethers',
  },
]
