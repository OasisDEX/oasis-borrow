import { ViewPositionSectionComponent } from 'features/earn/aave/components/ViewPositionSectionComponent'
import { Feature, getFeatureToggle } from 'helpers/useFeatureToggle'

import { AaveEarnFaq } from '../content/faqs/aave/earn'
import { AaveMultiplyFaq } from '../content/faqs/aave/multiply'
import {
  AavePositionHeaderNoDetails,
  headerWithDetails,
} from '../earn/aave/components/AavePositionHeader'
import { ManageSectionComponent } from '../earn/aave/components/ManageSectionComponent'
import { SimulateSectionComponent } from '../earn/aave/components/SimulateSectionComponent'
import { adjustRiskSliderConfig as earnAdjustRiskSliderConfig } from '../earn/aave/riskSliderConfig'
import { AaveMultiplyManageComponent } from '../multiply/aave/components/AaveMultiplyManageComponent'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from '../multiply/aave/riskSliderConfig'
import { AaveManageHeader, AaveOpenHeader } from './common/components/AaveHeader'
import { adjustRiskView } from './common/components/SidebarAdjustRiskView'
import { IStrategyConfig, ProductType, ProxyType } from './common/StrategyConfigTypes'

export enum ManageCollateralActionsEnum {
  DEPOSIT_COLLATERAL = 'deposit-collateral',
  WITHDRAW_COLLATERAL = 'withdraw-collateral',
}
export enum ManageDebtActionsEnum {
  BORROW_DEBT = 'borrow-debt',
  PAYBACK_DEBT = 'payback-debt',
}

const supportedAaveBorrowCollateralTokens = ['ETH']

export const strategies: Array<IStrategyConfig> = [
  {
    urlSlug: 'stETHeth',
    name: 'stETHeth',
    proxyType: ProxyType.DpmProxy,
    viewComponents: {
      headerOpen: headerWithDetails(earnAdjustRiskSliderConfig.riskRatios.minimum),
      headerManage: AavePositionHeaderNoDetails,
      headerView: AavePositionHeaderNoDetails,
      simulateSection: SimulateSectionComponent,
      vaultDetailsManage: ManageSectionComponent,
      vaultDetailsView: ViewPositionSectionComponent,
      adjustRiskView: adjustRiskView(earnAdjustRiskSliderConfig),
      positionInfo: AaveEarnFaq,
      sidebarTitle: 'open-earn.aave.vault-form.title',
      sidebarButton: 'open-earn.aave.vault-form.open-btn',
    },
    tokens: {
      collateral: 'STETH',
      debt: 'ETH',
      deposit: 'ETH',
    },
    riskRatios: earnAdjustRiskSliderConfig.riskRatios,
    type: 'Earn',
    featureToggle: 'AaveEarnSTETHETH',
  },

  {
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
      adjustRiskView: adjustRiskView(multiplyAdjustRiskSliderConfig),
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
    featureToggle: 'AaveMultiplyETHUSDC',
    type: 'Multiply',
  },

  {
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
      adjustRiskView: adjustRiskView(multiplyAdjustRiskSliderConfig),
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
    featureToggle: 'AaveMultiplySTETHUSDC',
    type: 'Multiply',
  },

  {
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
      adjustRiskView: adjustRiskView(multiplyAdjustRiskSliderConfig),
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
    featureToggle: 'AaveMultiplyWBTCUSDC',
    type: 'Multiply',
  },

  ...supportedAaveBorrowCollateralTokens.map((collateral) => {
    return {
      name: `borrow-${collateral}`,
      urlSlug: collateral,
      proxyType: ProxyType.DpmProxy,
      viewComponents: {
        headerOpen: AaveOpenHeader,
        headerManage: AaveManageHeader,
        headerView: AaveManageHeader,
        simulateSection: AaveMultiplyManageComponent,
        vaultDetailsManage: AaveMultiplyManageComponent,
        vaultDetailsView: AaveMultiplyManageComponent,
        adjustRiskView: adjustRiskView(multiplyAdjustRiskSliderConfig),
        positionInfo: AaveMultiplyFaq,
        sidebarTitle: 'open-multiply.sidebar.title',
        sidebarButton: 'open-multiply.sidebar.open-btn',
      },
      tokens: {
        collateral: collateral,
        debt: 'USDC',
        deposit: collateral,
      },
      riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
      featureToggle: 'AaveMultiplyWBTCUSDC' as Feature, // this will get set optional with https://github.com/OasisDEX/oasis-borrow/pull/1928
      type: 'Borrow' as ProductType,
    }
  }),
]

export function aaveStrategiesList(filterProduct?: IStrategyConfig['type']): IStrategyConfig[] {
  return Object.values(strategies)
    .filter(({ featureToggle }) => getFeatureToggle(featureToggle))
    .filter(({ type }) => (filterProduct ? type === filterProduct : true))
}

export function getAaveStrategy(strategyName: IStrategyConfig['name']) {
  return Object.values(strategies).filter(({ name }) => strategyName === name)
}

export function loadStrategyFromUrl(slug: string, positionType: string): IStrategyConfig {
  const strategy = strategies.find(
    (s) =>
      s.urlSlug.toUpperCase() === slug.toUpperCase() &&
      s.type.toUpperCase() === positionType.toUpperCase(),
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
  const strategy = strategies.find(
    (s) => s.tokens.collateral === collateralToken && s.tokens.debt === debtToken,
  )
  if (!strategy) {
    throw new Error(`Strategy not found for ${collateralToken}/${debtToken}`)
  }
  return strategy
}

export const supportedTokens = Array.from(
  new Set(
    Object.values(strategies)
      .map((strategy) => Object.values(strategy.tokens))
      .flatMap((tokens) => tokens),
  ),
)
