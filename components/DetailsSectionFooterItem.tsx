import { SystemStyleObject } from '@styled-system/css'
import React, { ReactNode } from 'react'
import { Box, Flex, Text } from 'theme-ui'

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
        gap: 3,
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

export function DetailsSectionFooterItem({
  title,
  value,
  change,
  sx = {},
}: DetailsSectionFooterItemProps & { sx?: SystemStyleObject }) {
  return (
    <Flex
      as="li"
      sx={{
        alignItems: 'flex-start',
        flexDirection: 'column',
        flexBasis: ['100%', null, null, '25%'],
        py: 3,
        pl: '12px',
        pr: '28px',
        '&:nth-child(-n+3)': {
          flexGrow: 1,
        },
        wordWrap: 'break-word',
        ...sx,
      }}
    >
      <Text variant="paragraph4" color="neutral80" sx={{ mb: 1 }}>
        {title}
      </Text>
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
