import { SystemStyleObject } from '@styled-system/css'
import React, { ReactNode } from 'react'
import { Box, Flex, Grid, Text } from 'theme-ui'

import {
  DetailsSectionContentCardChangePill,
  DetailsSectionContentCardChangePillProps,
} from './DetailsSectionContentCard'

interface DetailsSectionFooterItemWrapperProps {
  children: ReactNode
  columns?: number
}
interface DetailsSectionFooterItemProps {
  title: string
  value: string
  change?: DetailsSectionContentCardChangePillProps
}

export function DetailsSectionFooterItemWrapper({
  children,
  columns = 3,
}: DetailsSectionFooterItemWrapperProps) {
  return (
    <Grid
      as="ul"
      sx={{
        columnGap: 3,
        rowGap: 0,
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        mt: [0, null, null, -3],
        mb: [0, null, null, -3],
        p: 0,
      }}
    >
      {children}
    </Grid>
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
        flexDirection: 'column',
        alignItems: 'flex-start',
        py: 3,
        pl: '12px',
        pr: '28px',
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
