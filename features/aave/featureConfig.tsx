import {
  AavePositionHeader,
  AavePositionHeaderWithDetails,
} from 'features/earn/aave/components/AavePositionHeader'
import { ViewPositionSectionComponent } from 'features/earn/aave/components/ViewPositionSectionComponent'
import { AaveMultiplyHeader } from 'features/multiply/aave/components/AaveMultiplyHeader'
import { AaveMultiplyManageComponent } from 'features/multiply/aave/components/AaveMultiplyManageComponent'
import { AaveMultiplySimulate } from 'features/multiply/aave/components/AaveMultiplySimulate'
import React from 'react'
import { Observable, of } from 'rxjs'

import { formatBigNumber, formatPercent } from '../../helpers/formatters/format'
import { richFormattedBoundary } from './common/components/SidebarAdjustRiskView'
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
      adjustRiskViewConfig: {
        liquidationPriceFormatter: (qty) => {
          return richFormattedBoundary({ value: formatBigNumber(qty, 2), unit: 'STETH/ETH' })
        },
        rightBoundary: {
          valueExtractor: (data) => data?.oracleAssetPrice,
          formatter: (qty) => {
            return richFormattedBoundary({ value: formatBigNumber(qty, 2), unit: 'STETH/ETH' })
          },
          translationKey: 'open-earn.aave.vault-form.configure-multiple.current-price',
        },
      },
    },
    tokens: {
      collateral: 'STETH',
      debt: 'ETH',
    },
  },
  'aave-usdc': {
    name: 'stETHusdc',
    urlSlug: 'stETHusdc',
    viewComponents: {
      headerOpen: AaveMultiplyHeader,
      headerManage: AaveMultiplyHeader,
      headerView: AaveMultiplyHeader,
      simulateSection: AaveMultiplySimulate,
      vaultDetailsManage: AaveMultiplyManageComponent,
      vaultDetailsView: AaveMultiplyManageComponent,
      adjustRiskViewConfig: {
        liquidationPriceFormatter: (qty) => {
          return <>${formatBigNumber(qty, 2)}</>
        },
        rightBoundary: {
          valueExtractor: (data) => data?.ltv,
          formatter: (qty) => {
            return <>{formatPercent(qty.times(100), { precision: 1 })}</>
          },
          translationKey: 'vault-changes.loan-to-value',
        },
      },
    },
    tokens: {
      collateral: 'STETH',
      debt: 'USDC',
    },
  },
}
