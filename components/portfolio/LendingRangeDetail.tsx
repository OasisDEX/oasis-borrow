import { omniLendingPriceColors } from 'features/ajna/positions/earn/consts'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from 'theme-ui'

import { LendingRangeType } from 'lambdas/src/shared/lending-range'

const LendingRangeDot = ({ color }: { color?: string }) => (
  <Box
    sx={{
      height: '5px',
      minWidth: '10px',
      backgroundColor: color || 'neutral20',
      borderRadius: 'round',
      mx: '2px',
    }}
  />
)

export const LendingRangeDetail = ({ value }: { value: LendingRangeType }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  return (
    <Flex sx={{ flexDirection: 'row', width: '100%' }}>
      {Object.keys(LendingRangeType).map((lendingRangeValue) => (
        <Flex sx={{ flexDirection: 'column', justifyContent: 'flex-end' }}>
          {lendingRangeValue === value && (
            <Text variant="boldParagraph2" color={omniLendingPriceColors[lendingRangeValue]}>
              {tPortfolio(`lending-range-types.${lendingRangeValue}`)}
            </Text>
          )}
          <LendingRangeDot
            color={lendingRangeValue === value ? omniLendingPriceColors[value] : undefined}
          />
        </Flex>
      ))}
    </Flex>
  )
}
