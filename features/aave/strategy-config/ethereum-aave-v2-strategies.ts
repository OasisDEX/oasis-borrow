import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { IStrategyConfig, ProductType, ProxyType } from 'features/aave/common'
import { AaveManageHeader, AaveOpenHeader } from 'features/aave/common/components/AaveHeader'
import { adjustRiskView } from 'features/aave/common/components/SidebarAdjustRiskView'
import { DebtInput } from 'features/aave/open/components/DebtInput'
import { AaveBorrowManageComponent } from 'features/borrow/aave/AaveBorrowManageComponent'
import { AaveEarnFaqV2 } from 'features/content/faqs/aave/earn'
import { AaveMultiplyFaq } from 'features/content/faqs/aave/multiply'
import {
  AavePositionHeaderNoDetails,
  headerWithDetails,
} from 'features/earn/aave/components/AavePositionHeader'
import { ManageSectionComponent } from 'features/earn/aave/components/ManageSectionComponent'
import { SimulateSectionComponent } from 'features/earn/aave/components/SimulateSectionComponent'
import { ViewPositionSectionComponent } from 'features/earn/aave/components/ViewPositionSectionComponent'
import { adjustRiskSliders } from 'features/earn/aave/riskSliderConfig'
import { AaveMultiplyManageComponent } from 'features/multiply/aave/components/AaveMultiplyManageComponent'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from 'features/multiply/aave/riskSliderConfig'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

import { allActionsAvailable } from './all-actions-available'

const supportedAaveBorrowCollateralTokens = ['ETH', 'WBTC']
export const ethereumAaveV2BorrowStrategies: Array<IStrategyConfig> = [
  ...supportedAaveBorrowCollateralTokens.map((collateral) => {
    return {
      network: NetworkNames.ethereumMainnet,
      networkId: NetworkIds.MAINNET,
      name: `borrow-against-${collateral}`,
      urlSlug: collateral,
      proxyType: ProxyType.DpmProxy,
      viewComponents: {
        headerOpen: AaveOpenHeader,
        headerManage: AaveManageHeader,
        headerView: AaveManageHeader,
        simulateSection: AaveBorrowManageComponent,
        vaultDetailsManage: AaveBorrowManageComponent,
        vaultDetailsView: AaveBorrowManageComponent,
        secondaryInput: DebtInput,
        positionInfo: AaveMultiplyFaq,
        sidebarTitle: 'open-borrow.sidebar.title',
        sidebarButton: 'open-borrow.sidebar.open-btn',
      },
      tokens: {
        collateral: collateral,
        debt: 'USDC',
        deposit: collateral,
      },
      riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
      featureToggle: 'AaveBorrow' as const,
      type: 'Borrow' as ProductType,
      protocol: LendingProtocol.AaveV2 as AaveLendingProtocol,
      availableActions: allActionsAvailable,
      executeTransactionWith: 'web3' as const,
    }
  }),
]
export const ethereumAaveV2Strategies: Array<IStrategyConfig> = [
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'stETHethV2',
    urlSlug: 'stETHeth',
    proxyType: ProxyType.DpmProxy,
    viewComponents: {
      headerOpen: headerWithDetails(adjustRiskSliders.stethEth.riskRatios.minimum),
      headerManage: AavePositionHeaderNoDetails,
      headerView: AavePositionHeaderNoDetails,
      simulateSection: SimulateSectionComponent,
      vaultDetailsManage: ManageSectionComponent,
      vaultDetailsView: ViewPositionSectionComponent,
      secondaryInput: adjustRiskView(adjustRiskSliders.stethEth),
      positionInfo: AaveEarnFaqV2,
      sidebarTitle: 'open-earn.aave.vault-form.title',
      sidebarButton: 'open-earn.aave.vault-form.open-btn',
    },
    tokens: {
      collateral: 'STETH',
      debt: 'ETH',
      deposit: 'ETH',
    },
    riskRatios: adjustRiskSliders.stethEth.riskRatios,
    type: 'Earn',
    protocol: LendingProtocol.AaveV2,
    featureToggle: 'AaveV2ProductCard',
    availableActions: allActionsAvailable,
    executeTransactionWith: 'web3',
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'ethusdcV2',
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
    protocol: LendingProtocol.AaveV2,
    featureToggle: 'AaveV2ProductCard',
    availableActions: allActionsAvailable,
    executeTransactionWith: 'web3',
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'stETHusdcV2',
    urlSlug: 'stETHusdc',
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
      collateral: 'STETH',
      debt: 'USDC',
      deposit: 'STETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: 'Multiply',
    protocol: LendingProtocol.AaveV2,
    featureToggle: 'AaveV2ProductCard',
    availableActions: allActionsAvailable,
    executeTransactionWith: 'web3',
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'wBTCusdcV2',
    urlSlug: 'wBTCusdc',
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
    protocol: LendingProtocol.AaveV2,
    featureToggle: 'AaveV2ProductCard',
    availableActions: allActionsAvailable,
    executeTransactionWith: 'web3',
  },
  ...ethereumAaveV2BorrowStrategies,
]
