import { Skeleton } from 'components/Skeleton'
import React from 'react'
import { Box, Flex } from 'theme-ui'

function PortfolioPositionBlockDetailLoadingState() {
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Skeleton width="75px" />
      <Skeleton width="150px" height="24px" sx={{ mt: 2 }} />
    </Flex>
  )
}

export const PortfolioPositionBlockLoadingState = () => (
  <Box
    sx={{
      width: '100%',
      border: '1px solid',
      borderColor: 'neutral20',
      borderRadius: 'large',
      p: 3,
    }}
  >
    <Skeleton width="150px" height="24px" sx={{ mt: 1 }} />
    <Flex sx={{ mt: '28px' }}>
      <Flex sx={{ mt: '10px', ml: '2px' }}>
        <Box sx={{ mr: '-12px' }}>
          <Skeleton circle width="26px" height="26px" />
        </Box>
        <Box>
          <Skeleton circle width="26px" height="26px" />
        </Box>
      </Flex>
      <Flex sx={{ flexDirection: 'column', ml: '12px' }}>
        <Skeleton width="150px" height="24px" />
        <Skeleton width="100px" sx={{ mt: 1 }} />
      </Flex>
    </Flex>
    <Flex
      sx={{
        justifyContent: 'space-between',
        mt: 4,
        mb: 3,
        pb: '38px',
        borderBottom: '1px solid',
        borderColor: 'neutral20',
      }}
    >
      <PortfolioPositionBlockDetailLoadingState />
      <PortfolioPositionBlockDetailLoadingState />
      <PortfolioPositionBlockDetailLoadingState />
      <PortfolioPositionBlockDetailLoadingState />
    </Flex>
    <Flex>
      <Flex sx={{ ml: 'auto' }}>
        <Skeleton width="130px" height="36px" />
      </Flex>
    </Flex>
  </Box>
)
