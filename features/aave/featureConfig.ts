import {
  AavePositionHeader,
  AavePositionHeaderWithDetails,
} from 'features/earn/aave/components/AavePositionHeader'
import { ViewPositionSectionComponent } from 'features/earn/aave/components/ViewPositionSectionComponent'
import { Observable, of } from 'rxjs'

import { StrategyConfig } from './common/StrategyConfigType'
import { ManageSectionComponent } from './manage/components'
import { SimulateSectionComponent } from './open/components'

export function getAaveStrategy$(_address: string): Observable<StrategyConfig> {
  // TODO: properly detect fom chain or georgi method
  return of(strategyConfig['aave-earn'])
}

export const strategyConfig: Record<string, StrategyConfig> = {
  'aave-earn': {
    urlSlug: 'stETHeth',
    name: 'stETHeth',
    viewComponents: {
      headerOpen: AavePositionHeaderWithDetails,
      headerManage: AavePositionHeader,
      headerView: AavePositionHeader,
      simulateSection: SimulateSectionComponent,
      vaultDetailsManage: ManageSectionComponent,
      vaultDetailsView: ViewPositionSectionComponent,
    },
  },
}
