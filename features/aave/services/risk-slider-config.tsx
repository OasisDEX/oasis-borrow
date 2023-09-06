import React from 'react'
import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { AdjustRiskViewConfig } from 'features/aave/components'
import { formatBigNumber, formatPercent } from 'helpers/formatters/format'

export const adjustRiskSliderConfig: AdjustRiskViewConfig = {
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
  riskRatios: {
    minimum: new RiskRatio(new BigNumber(5), RiskRatio.TYPE.COL_RATIO),
    default: new RiskRatio(new BigNumber(5), RiskRatio.TYPE.COL_RATIO),
  },
}
