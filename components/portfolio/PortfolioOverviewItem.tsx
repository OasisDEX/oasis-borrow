import type { TranslateStringType } from 'helpers/translateStringType'
import type { ReactNode } from 'react'
import React from 'react'
import { Flex, Text } from 'theme-ui'

export const PortfolioOverviewItem = ({
  header,
  value,
  subValue,
  firstInColumn,
}: {
  header: TranslateStringType
  value: ReactNode
  subValue?: ReactNode
  firstInColumn?: boolean
}) => {
  return (
    <Flex
      sx={{
        ml: firstInColumn ? 0 : [0, 4],
        mb: [4, 0],
        flexDirection: 'column',
        minWidth: ['auto', '150px'],
      }}
    >
      <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
        {header}
      </Text>
      {value}
      {subValue}
    </Flex>
  )
}
