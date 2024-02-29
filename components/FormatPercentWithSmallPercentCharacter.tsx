import type BigNumber from 'bignumber.js'
import { formatPercent } from 'helpers/formatters/format'
import { Box, Text } from 'theme-ui'

export const FormatPercentWithSmallPercentCharacter = ({ value }: { value: BigNumber }) => {
  return (
    <Box as="span">
      {formatPercent(value, { noPercentSign: true })}
      <Text as="span" variant="paragraph4">
        %
      </Text>
    </Box>
  )
}
