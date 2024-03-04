import type BigNumber from 'bignumber.js'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Text } from 'theme-ui'

export const FormatPercentWithSmallPercentCharacter = ({
  value,
  precision,
  sx,
}: {
  value: BigNumber
  precision?: number
  sx?: ThemeUIStyleObject
}) => {
  return (
    <Box as="span" sx={sx}>
      {formatDecimalAsPercent(value, { noPercentSign: true, precision: precision ?? 2 })}
      <Text as="span" variant="paragraph4">
        %
      </Text>
    </Box>
  )
}
