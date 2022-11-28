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
import { StrategyConfig } from './common/StrategyConfigTypes'

type StrategyConfigName = 'aave-earn' | 'aave-multiply'

export const strategies: Record<StrategyConfigName, StrategyConfig> = {
  'aave-earn': {
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
    product: 'earn',
    enabled: true,
  },
  'aave-multiply': {
    name: 'stETHusdc',
    urlSlug: 'stETHusdc',
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
    product: 'multiply',
    enabled: false,
  },
} as const

export function aaveStrategiesList(filterProduct: StrategyConfig['product']) {
  return Object.values(strategies)
    .filter(({ enabled }) => enabled)
    .filter(({ product }) => (filterProduct ? product === filterProduct : true))
    .map((s) => s.name)
}
