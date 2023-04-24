import { RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
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
import { getFeatureToggle } from 'helpers/useFeatureToggle'
import { zero } from 'helpers/zero'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

import { IStrategyConfig, ManagePositionAvailableActions, ProxyType } from './common'
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

export const strategies: Array<IStrategyConfig> = [
  {
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
    featureToggle: 'AaveV3EarnWSTETH' as const,
    availableActions: ['adjust', 'close'],
    defaultSlippage: new BigNumber(0.001),
  },
  {
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
    availableActions: allActionsAvailable,
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
    availableActions: allActionsAvailable,
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
    availableActions: allActionsAvailable,
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
    availableActions: allActionsAvailable,
  },

  ...supportedAaveBorrowCollateralTokens.map((collateral) => {
    return {
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
      type: 'Borrow' as const,
      protocol: LendingProtocol.AaveV2 as AaveLendingProtocol,
      availableActions: allActionsAvailable,
    }
  }),
]

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
  const strategy = strategies.find(
    (s) => s.tokens.collateral === collateralToken && s.tokens.debt === debtToken,
  )
  if (!strategy) {
    throw new Error(`Strategy not found for ${collateralToken}/${debtToken}`)
  }
  return strategy
}

export function getSupportedTokens(protocol: LendingProtocol) {
  return Array.from(
    new Set(
      Object.values(strategies)
        .filter(({ protocol: p }) => p === protocol)
        .map((strategy) => Object.values(strategy.tokens))
        .flatMap((tokens) => tokens),
    ),
  )
}

export function convertDefaultRiskRatioToActualRiskRatio(
  defaultRiskRatio: IStrategyConfig['riskRatios']['default'],
  ltv?: BigNumber,
) {
  return defaultRiskRatio === 'slightlyLessThanMaxRisk'
    ? new RiskRatio(ltv?.times('0.99') || zero, RiskRatio.TYPE.LTV)
    : defaultRiskRatio
}
