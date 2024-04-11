import type { PropsWithChildren, ReactNode } from 'react'
import React from 'react'
import { theme } from 'theme'
import { Box, Flex } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface AssetsFiltersContainerProps {
  filters: ReactNode[]
  isSticky?: boolean
}

export function AssetsFiltersContainer({
  filters,
  isSticky = false,
}: PropsWithChildren<AssetsFiltersContainerProps>) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  return (
    <Flex
      sx={{
        ...(!isSmallerScreen && {
          position: isSticky ? 'sticky' : 'relative',
          top: 0,
        }),
        flexDirection: ['column', 'row'],
        flexWrap: ['wrap', null, 'nowrap'],
        gap: '12px',
        py: 3,
        backgroundColor: 'neutral10',
        borderBottom: '1px solid',
        borderBottomColor: 'neutral20',
        borderTopLeftRadius: 'large',
        borderTopRightRadius: 'large',
        zIndex: 2,
      }}
    >
      {filters.map((filter) => (
        <Box
          sx={{
            flex: ['1', '1 45%', '1'],
            maxWidth: ['none', null, null, '205px'],
            '&:last-of-type': {
              ml: [0, null, null, 'auto'],
            },
          }}
        >
          {filter}
        </Box>
      ))}
    </Flex>
  )
}
