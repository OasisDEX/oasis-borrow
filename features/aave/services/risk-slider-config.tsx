import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { AdjustRiskViewConfig } from 'features/aave/components'
import type { ConfigResponseType } from 'helpers/config'
import { getLocalAppConfig } from 'helpers/config'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import React from 'react'

const getRiskRatio = (type: keyof ConfigResponseType['parameters']['aaveLike']['riskRatios']) => {
  const { aaveLike } = getLocalAppConfig('parameters')
  return new BigNumber(aaveLike?.riskRatios?.[type] ?? 5) // 5 as fallback, optional for the tests to pass
}

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
    minimum: new RiskRatio(getRiskRatio('minimum'), RiskRatio.TYPE.COL_RATIO),
    default: new RiskRatio(getRiskRatio('default'), RiskRatio.TYPE.COL_RATIO),
  },
}
