import BigNumber from 'bignumber.js'
import { formatPercent } from 'helpers/formatters/format'
import { Text } from 'theme-ui'

const assetsTableDataCellProtocolBackgrounds = {
  'Aave v2': 'linear-gradient(229.92deg, #B6509E 15.42%, #2EBAC6 84.42%)',
  'Aave v3': 'linear-gradient(229.92deg, #B6509E 15.42%, #2EBAC6 84.42%)',
  Ajna: 'linear-gradient(90deg, #F154DB 0%, #974EEA 100%)',
  Maker: 'linear-gradient(152.36deg, #218F6F 17.19%, #66C5A9 95.07%)',
}

export type AssetsTableDataCellProtocols = keyof typeof assetsTableDataCellProtocolBackgrounds

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
