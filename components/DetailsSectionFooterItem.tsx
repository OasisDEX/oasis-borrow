import React, { ReactNode } from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

import {
  DetailsSectionContentCardChangePill,
  DetailsSectionContentCardChangePillProps,
} from './DetailsSectionContentCard'

interface DetailsSectionFooterItemProps {
  title: string
  value: string
  change?: DetailsSectionContentCardChangePillProps
}

export function DetailsSectionFooterItemWrapper({ children }: { children: ReactNode }) {
  return (
    <Flex
      as="ul"
      sx={{
        mx: -1,
        mt: [0, null, null, -3],
        mb: [0, null, null, -3],
        p: 0,
        flexWrap: 'wrap',
      }}
    >
      {children}
    </Flex>
  )
}

export function DetailsSectionFooterItem({ title, value, change }: DetailsSectionFooterItemProps) {
  return (
    <Flex
      as="li"
      sx={{
        alignItems: 'flex-start',
        flexDirection: 'column',
        flexBasis: ['100%', null, null, '25%'],
        p: 3,
        pl: 0,
        pr: 4,
        '&:nth-child(-n+3)': {
          flexGrow: 1,
        },
        wordWrap: 'break-word',
      }}
    >
      <Heading as="h3" variant="label" sx={{ mb: 1 }}>
        {title}
      </Heading>
      <Text as="p" variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
        {value}
      </Text>
      {change && (
        <Box sx={{ maxWidth: '100%', mt: 2 }}>
          <DetailsSectionContentCardChangePill {...change} />
        </Box>
      )}
    </Flex>
  )
}
