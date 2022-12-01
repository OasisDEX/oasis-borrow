import { ViewPositionSectionComponent } from 'features/earn/aave/components/ViewPositionSectionComponent'

import {
  AavePositionHeaderNoDetails,
  headerWithDetails,
} from '../earn/aave/components/AavePositionHeader'
import { ManageSectionComponent } from '../earn/aave/components/ManageSectionComponent'
import { SimulateSectionComponent } from '../earn/aave/components/SimulateSectionComponent'
import { adjustRiskSliderConfig as earnAdjustRiskSliderConfig } from '../earn/aave/riskSliderConfig'
import {
  AaveMultiplyManageHeader,
  AaveMultiplyOpenHeader,
} from '../multiply/aave/components/AaveMultiplyHeader'
import { AaveMultiplyManageComponent } from '../multiply/aave/components/AaveMultiplyManageComponent'
import { adjustRiskSliderConfig as multiplyAdjustRiskSliderConfig } from '../multiply/aave/riskSliderConfig'
import { adjustRiskView } from './common/components/SidebarAdjustRiskView'
import { IStrategyConfig } from './common/StrategyConfigTypes'

export const strategies: Array<IStrategyConfig> = [
  {
    urlSlug: 'stETHeth',
    name: 'stETHeth',
    viewComponents: {
      headerOpen: headerWithDetails(earnAdjustRiskSliderConfig.riskRatios.minimum),
      headerManage: AavePositionHeaderNoDetails,
      headerView: AavePositionHeaderNoDetails,
      simulateSection: SimulateSectionComponent,
      vaultDetailsManage: ManageSectionComponent,
      vaultDetailsView: ViewPositionSectionComponent,
      adjustRiskView: adjustRiskView(earnAdjustRiskSliderConfig),
    },
    tokens: {
      collateral: 'STETH',
      debt: 'ETH',
      deposit: 'ETH',
    },
    riskRatios: earnAdjustRiskSliderConfig.riskRatios,
    enabled: true,
  },
  {
    name: 'ethusdc',
    urlSlug: 'ethusdc',
    viewComponents: {
      headerOpen: AaveMultiplyOpenHeader,
      headerManage: AaveMultiplyManageHeader,
      headerView: AaveMultiplyManageHeader,
      simulateSection: AaveMultiplyManageComponent,
      vaultDetailsManage: AaveMultiplyManageComponent,
      vaultDetailsView: AaveMultiplyManageComponent,
      adjustRiskView: adjustRiskView(multiplyAdjustRiskSliderConfig),
    },
    tokens: {
      collateral: 'ETH',
      debt: 'USDC',
      deposit: 'ETH',
    },
    riskRatios: multiplyAdjustRiskSliderConfig.riskRatios,
    enabled: false,
  },
]

export function loadStrategyFromSlug(slug: string): IStrategyConfig {
  const strategy = strategies.find((s) => s.urlSlug === slug)
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

export const aaveStrategiesList = strategies.filter(({ enabled }) => enabled).map((s) => s.name)
