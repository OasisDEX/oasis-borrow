import { RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networkIds'
import { AaveBorrowManageComponent } from 'features/borrow/aave/AaveBorrowManageComponent'
import { AaveEarnFaqV2, AaveEarnFaqV3 } from 'features/content/faqs/aave/earn'
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
import { isSupportedNetwork, NetworkNames } from 'helpers/networkNames'
import { getFeatureToggle } from 'helpers/useFeatureToggle'
import { zero } from 'helpers/zero'
import { AaveLendingProtocol, isLendingProtocol, LendingProtocol } from 'lendingProtocols'

import {
  isSupportedProductType,
  IStrategyConfig,
  ManagePositionAvailableActions,
  ProductType,
  ProxyType,
} from './common'
import { AaveManageHeader, AaveOpenHeader } from './common/components/AaveHeader'
import { adjustRiskView } from './common/components/SidebarAdjustRiskView'
import { DebtInput } from './open/components/DebtInput'

export enum ManageCollateralActionsEnum {
  DEPOSIT_COLLATERAL = 'deposit-collateral',
  WITHDRAW_COLLATERAL = 'withdraw-collateral',
}
export enum ManageDebtActionsEnum {
  BORROW_DEBT = 'borrow-debt',
  PAYBACK_DEBT = 'payback-debt',
}

const allActionsAvailable: ManagePositionAvailableActions[] = [
  'adjust',
  'manage-debt',
  'manage-collateral',
  'close',
]

const supportedAaveBorrowCollateralTokens = ['ETH', 'WBTC']

const optimismStrategies: Array<IStrategyConfig> = [
  {
    network: NetworkNames.optimismMainnet,
    networkId: NetworkIds.OPTIMISMMAINNET,
    name: 'optimism-ethusdc',
    urlSlug: 'optimism-ethusdc',
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
    availableActions: ['close'],
  },
  {
    network: NetworkNames.optimismMainnet,
    networkId: NetworkIds.OPTIMISMMAINNET,
    name: 'optimism-wstethusdc',
    urlSlug: 'optimism-wstethusdc',
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
    availableActions: ['close'],
  },
  {
    network: NetworkNames.optimismMainnet,
    networkId: NetworkIds.OPTIMISMMAINNET,
    name: 'optimism-wbtcusdc',
    urlSlug: 'optimism-wbtcusdc',
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
    availableActions: ['close'],
  },
]

const arbitrumStrategies: Array<IStrategyConfig> = [
  {
    network: NetworkNames.arbitrumMainnet,
    networkId: NetworkIds.ARBITRUMMAINNET,
    name: 'arbitrum-ethusdc',
    urlSlug: 'arbitrum-ethusdc',
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
    featureToggle: 'AaveV3Arbitrum',
    availableActions: ['close'],
  },
  {
    network: NetworkNames.arbitrumMainnet,
    networkId: NetworkIds.ARBITRUMMAINNET,
    name: 'arbitrum-wstethusdc',
    urlSlug: 'arbitrum-wstethusdc',
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
    featureToggle: 'AaveV3Arbitrum',
    availableActions: ['close'],
  },
  {
    network: NetworkNames.arbitrumMainnet,
    networkId: NetworkIds.ARBITRUMMAINNET,
    name: 'arbitrum-wbtcusdc',
    urlSlug: 'arbitrum-wbtcusdc',
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
    featureToggle: 'AaveV3Arbitrum',
    availableActions: ['close'],
  },
]

const ethereumStrategies: Array<IStrategyConfig> = [
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    urlSlug: 'wstETHeth',
    name: 'wstETHeth',
    proxyType: ProxyType.DpmProxy,
    viewComponents: {
      headerOpen: headerWithDetails(adjustRiskSliders.wstethEth.riskRatios.minimum),
      headerManage: AavePositionHeaderNoDetails,
      headerView: AavePositionHeaderNoDetails,
      simulateSection: SimulateSectionComponent,
      vaultDetailsManage: ManageSectionComponent,
      vaultDetailsView: ViewPositionSectionComponent,
      secondaryInput: adjustRiskView(adjustRiskSliders.wstethEth),
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
    availableActions: ['adjust', 'close'],
    defaultSlippage: new BigNumber(0.001),
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    urlSlug: 'stETHeth',
    name: 'stETHeth',
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
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'ethusdc',
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
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'stETHusdc',
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
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'wBTCusdc',
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
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'ethusdc',
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
    featureToggle: 'AaveV3MultiplyETHusdc',
    availableActions: allActionsAvailable,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'cbETHusdc',
    urlSlug: 'cbETHusdc',
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
      collateral: 'CBETH',
      debt: 'USDC',
      deposit: 'CBETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    type: 'Multiply',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3MultiplycbETHusdc',
    availableActions: allActionsAvailable,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    name: 'wBTCusdc',
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
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3MultiplywBTCusdc',
    availableActions: allActionsAvailable,
  },
  {
    network: NetworkNames.ethereumMainnet,
    networkId: NetworkIds.MAINNET,
    urlSlug: 'wstETHeth',
    name: 'wstETHeth',
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
      debt: 'ETH',
      deposit: 'ETH',
    },
    riskRatios: adjustRiskSliders.wstethEth.riskRatios,
    type: 'Multiply',
    protocol: LendingProtocol.AaveV3,
    featureToggle: 'AaveV3MultiplywstETHeth',
    availableActions: allActionsAvailable,
  },

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
    }
  }),
]

export const strategies = [...optimismStrategies, ...arbitrumStrategies, ...ethereumStrategies]

export function aaveStrategiesList(
  filterProduct?: IStrategyConfig['type'],
  filterProtocol?: IStrategyConfig['protocol'],
): IStrategyConfig[] {
  return Object.values(strategies)
    .filter(({ featureToggle }) => (featureToggle ? getFeatureToggle(featureToggle) : true))
    .filter(({ type }) => (filterProduct ? type === filterProduct : true))
    .filter(({ protocol }) => (filterProtocol ? protocol === filterProtocol : true))
}

export function getAaveStrategy(strategyName: IStrategyConfig['name']) {
  return Object.values(strategies).filter(({ name }) => strategyName === name)
}

export function loadStrategyFromUrl(
  slug: string,
  protocol: string,
  positionType: string,
): IStrategyConfig {
  const strategy = strategies.find(
    (s) =>
      s.urlSlug.toUpperCase() === slug.toUpperCase() &&
      s.type.toUpperCase() === positionType.toUpperCase() &&
      s.protocol.toUpperCase() === protocol.toUpperCase(),
  )
  if (!strategy) {
    throw new Error(`Strategy not found for slug: ${slug}`)
  }
  return strategy
}

export function loadStrategyFromTokens(
  collateralToken: string,
  debtToken: string,
): IStrategyConfig {
  // Aave uses WETH gateway for ETH (we have ETH strategy specified)
  // so we have to convert that on the fly just to find the strategy
  // this is then converted back to WETH using wethInsteadOfEth
  const actualCollateralToken = collateralToken === 'WETH' ? 'ETH' : collateralToken
  const actualDebtToken = debtToken === 'WETH' ? 'ETH' : debtToken
  const strategy = strategies.find(
    (s) => s.tokens.collateral === actualCollateralToken && s.tokens.debt === actualDebtToken,
  )
  if (!strategy) {
    throw new Error(
      `Strategy not found for ${collateralToken}/${debtToken} (${actualCollateralToken}/${actualDebtToken})`,
    )
  }
  return strategy
}

export function getSupportedTokens(protocol: LendingProtocol, network: NetworkNames) {
  return Array.from(
    new Set(
      Object.values(strategies)
        .filter(({ protocol: p, network: n }) => p === protocol && n === network)
        .map((strategy) => Object.values(strategy.tokens))
        .flatMap((tokens) => tokens),
    ),
  )
}

export function isSupportedStrategy(
  network: string | NetworkNames,
  protocol: string | LendingProtocol,
  product: string | ProductType,
  strategy: string,
): [true, IStrategyConfig] | [false, undefined] {
  if (
    isSupportedNetwork(network) &&
    isLendingProtocol(protocol) &&
    isSupportedProductType(product)
  ) {
    const definedStrategy = strategies.find(
      (s) =>
        s.network === network &&
        s.protocol === protocol &&
        s.urlSlug.toLowerCase() === strategy.toLowerCase() &&
        s.type.toLowerCase() === product.toLowerCase(),
    )
    if (definedStrategy) {
      return [true, definedStrategy]
    } else {
      return [false, undefined]
    }
  }

  return [false, undefined]
}

export function convertDefaultRiskRatioToActualRiskRatio(
  defaultRiskRatio: IStrategyConfig['riskRatios']['default'],
  ltv?: BigNumber,
) {
  return defaultRiskRatio === 'slightlyLessThanMaxRisk'
    ? new RiskRatio(ltv?.times('0.99') || zero, RiskRatio.TYPE.LTV)
    : defaultRiskRatio
}
