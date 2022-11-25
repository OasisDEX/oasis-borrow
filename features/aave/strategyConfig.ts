import { ViewPositionSectionComponent } from 'features/earn/aave/components/ViewPositionSectionComponent'

import {
  AavePositionHeaderNoDetails,
  headerWithDetails,
} from '../earn/aave/components/AavePositionHeader'
import { ManageSectionComponent } from '../earn/aave/components/ManageSectionComponent'
import { SimulateSectionComponent } from '../earn/aave/components/SimulateSectionComponent'
import { adjustRiskSliderConfig as earnAdjustRiskSliderConfig } from '../earn/aave/riskSliderConfig'
import { AaveMultiplyHeader } from '../multiply/aave/components/AaveMultiplyHeader'
import { AaveMultiplyManageComponent } from '../multiply/aave/components/AaveMultiplyManageComponent'
import { AaveMultiplySimulate } from '../multiply/aave/components/AaveMultiplySimulate'
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
    enabled: true,
  },
  'aave-multiply': {
    name: 'stETHusdc',
    urlSlug: 'stETHusdc',
    viewComponents: {
      headerOpen: AaveMultiplyHeader,
      headerManage: AaveMultiplyHeader,
      headerView: AaveMultiplyHeader,
      simulateSection: AaveMultiplySimulate,
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
} as const

export const aaveStrategiesList = Object.values(strategies)
  .filter(({ enabled }) => enabled)
  .map((s) => s.name)
