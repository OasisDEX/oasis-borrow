import { omniLendingPriceColors } from 'features/ajna/positions/earn/consts'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from 'theme-ui'

import type { LendingRangeType } from 'lambdas/src/shared/lending-range'

const LendingRangeDot = ({ color }: { color?: string }) => (
  <Box
    sx={{
      height: '5px',
      width: color ? '50%' : '10%',
      backgroundColor: color || 'neutral20',
      borderRadius: 'round',
      mx: '2px',
    }}
  />
)

export const LendingRangeDetail = ({ value }: { value: LendingRangeType }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  return (
    <Flex sx={{ flexDirection: 'column', width: '100%' }}>
      <Text variant="boldParagraph2" color={omniLendingPriceColors[value]}>
        {tPortfolio(`lending-range-types.${value}`)}
      </Text>
      <Flex sx={{ flexDirection: 'row', width: '100%' }}>
        <LendingRangeDot color={value === 'aboveLup' ? omniLendingPriceColors[value] : undefined} />
        <LendingRangeDot color={value === 'belowLup' ? omniLendingPriceColors[value] : undefined} />
        <LendingRangeDot color={value === 'belowHtp' ? omniLendingPriceColors[value] : undefined} />
      </Flex>
    </Flex>
  )
}
