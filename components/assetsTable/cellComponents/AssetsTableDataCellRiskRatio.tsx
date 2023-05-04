import BigNumber from 'bignumber.js'
import { formatPercent } from 'helpers/formatters/format'
import React from 'react'
import { Text } from 'theme-ui'

interface AssetsTableDataCellRiskRatioProps {
  level: number
  isAtRiskDanger: boolean
  isAtRiskWarning: boolean
}

export function AssetsTableDataCellRiskRatio({
  level,
  isAtRiskDanger,
  isAtRiskWarning,
}: AssetsTableDataCellRiskRatioProps) {
  return (
    <Text
      as="span"
      sx={{
        color: isAtRiskDanger ? 'critical100' : isAtRiskWarning ? 'warning100' : 'success100',
      }}
    >
      {formatPercent(new BigNumber(level), { precision: 2 })}
    </Text>
  )
}
