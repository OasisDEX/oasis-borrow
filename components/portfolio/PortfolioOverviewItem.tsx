import type { TranslateStringType } from 'helpers/translateStringType'
import type { ReactNode } from 'react'
import React from 'react'
import { Flex, Text } from 'theme-ui'

export const PortfolioOverviewItem = ({
  header,
  value,
  subValue,
}: {
  header: TranslateStringType
  value: ReactNode
  subValue?: ReactNode
}) => {
  return (
    <Flex
      sx={{
        mb: [4, 0],
        pr: 3,
        flexDirection: 'column',
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
