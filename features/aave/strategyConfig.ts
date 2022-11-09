import { ViewPositionSectionComponent } from 'features/earn/aave/components/ViewPositionSectionComponent'

import {
  AavePositionHeaderNoDetails,
  AavePositionHeaderWithDetails,
} from '../earn/aave/components/AavePositionHeader'
import { ManageSectionComponent } from '../earn/aave/components/ManageSectionComponent'
import { SimulateSectionComponent } from '../earn/aave/components/SimulateSectionComponent'
import { AaveMultiplyHeader } from '../multiply/aave/components/AaveMultiplyHeader'
import { AaveMultiplyManageComponent } from '../multiply/aave/components/AaveMultiplyManageComponent'
import { AaveMultiplySimulate } from '../multiply/aave/components/AaveMultiplySimulate'
import { StrategyConfig } from './common/StrategyConfigTypes'

type StrategyConfigName = 'aave-earn' | 'aave-multiply'

export const strategies: Record<StrategyConfigName, StrategyConfig> = {
  'aave-earn': {
    urlSlug: 'stETHeth',
    name: 'stETHeth',
    viewComponents: {
      headerOpen: AavePositionHeaderWithDetails,
      headerManage: AavePositionHeaderNoDetails,
      headerView: AavePositionHeaderNoDetails,
      simulateSection: SimulateSectionComponent,
      vaultDetailsManage: ManageSectionComponent,
      vaultDetailsView: ViewPositionSectionComponent,
    },
    tokens: {
      collateral: 'STETH',
      debt: 'ETH',
    },
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
    },
  },
} as const
