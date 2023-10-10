import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { AdjustRiskViewConfig } from 'features/aave/components'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import React from 'react'

export const adjustRiskSliderConfig: AdjustRiskViewConfig = {
  liquidationPriceFormatter: (qty, token) => {
    return (
      <>
        {token ? '' : '$'}
        {formatCryptoBalance(qty)}
        {` ${token}`}
      </>
    )
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
