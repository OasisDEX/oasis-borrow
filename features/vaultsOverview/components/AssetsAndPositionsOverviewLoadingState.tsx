import { Skeleton } from 'components/Skeleton'
import React from 'react'
import { Box, Card, Flex, Grid } from 'theme-ui'
import { useBreakpointIndex } from 'theme/useBreakpointIndex'

export function AssetsAndPositionsOverviewLoadingState() {
  const breakpointIndex = useBreakpointIndex()

  return (
    <Card variant="positionsPage">
      <Grid gap={0} sx={{ gridTemplateColumns: ['100%', '40% 60%'] }}>
        {breakpointIndex !== 0 && (
          <Box
            sx={{
              mr: '48px',
              pr: '48px',
              borderRight: 'solid 1px',
              borderRightColor: 'neutral20',
            }}
          >
            <Skeleton count={2} />
            <Skeleton width="120px" height="48px" sx={{ mt: 3 }} />
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton width="258px" />
          <Flex sx={{ mt: 4, justifyContent: 'space-between', alignContent: 'stretch' }}>
            {breakpointIndex !== 0 && (
              <Skeleton width="258px" height="258px" doughnut={4} sx={{ mt: 2 }} />
            )}
            <Box sx={{ flex: 1, mt: 2, ml: [null, '48px'] }}>
              <Skeleton count={5} />
            </Box>
          </Flex>
        </Box>
      </Grid>
    </Card>
  )
}
