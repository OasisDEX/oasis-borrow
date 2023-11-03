import { Skeleton } from 'components/Skeleton'
import React from 'react'
import { Box, Flex } from 'theme-ui'

export const PortfolioPositionBlockSkeleton = () => (
  <Box
    sx={{
      width: '100%',
      border: '1px solid',
      borderColor: 'neutral20',
      borderRadius: 'large',
      mb: 4,
      p: 3,
    }}
  >
    <Flex sx={{ justifyContent: 'space-between', mb: 3 }}>
      <Skeleton height={25} width={60} />
      <Skeleton height={25} width={120} />
    </Flex>
    <Flex sx={{ flexDirection: 'row' }}>
      <Skeleton width={40} height={40} />
      <Flex sx={{ flexDirection: 'column', ml: 2 }}>
        <Skeleton width={60} height={20} sx={{ mb: '5px' }} />
        <Skeleton width={100} height={15} />
      </Flex>
    </Flex>
    <Flex
      sx={{
        justifyContent: 'space-between',
        my: 3,
        borderBottom: '1px solid',
        borderColor: 'neutral20',
        paddingBottom: 3,
      }}
    >
      <Flex sx={{ flexDirection: 'column' }}>
        <Skeleton height={15} width={50} />
        <Skeleton height={25} width={80} sx={{ mt: 2 }} />
      </Flex>
      <Flex sx={{ flexDirection: 'column' }}>
        <Skeleton height={15} width={50} />
        <Skeleton height={25} width={80} sx={{ mt: 2 }} />
      </Flex>
      <Flex sx={{ flexDirection: 'column' }}>
        <Skeleton height={15} width={50} />
        <Skeleton height={25} width={80} sx={{ mt: 2 }} />
      </Flex>
      <Flex sx={{ flexDirection: 'column' }}>
        <Skeleton height={15} width={50} />
        <Skeleton height={25} width={80} sx={{ mt: 2 }} />
      </Flex>
    </Flex>
    <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <Flex sx={{ flexDirection: 'column' }}>
        <Skeleton width={100} height={20} sx={{ mb: 2 }} />
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ mr: 2 }}>
            <Skeleton width={40} height={40} />
          </Box>
          <Box sx={{ mr: 2 }}>
            <Skeleton width={40} height={40} />
          </Box>
          <Box sx={{ mr: 2 }}>
            <Skeleton width={40} height={40} />
          </Box>
          <Box sx={{ mr: 2 }}>
            <Skeleton width={40} height={40} />
          </Box>
        </Flex>
      </Flex>
      <Flex>
        <Skeleton width={150} height={40} />
      </Flex>
    </Flex>
  </Box>
)
