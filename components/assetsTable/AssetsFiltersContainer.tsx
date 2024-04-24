import type { PropsWithChildren, ReactNode } from 'react'
import React from 'react'
import { theme } from 'theme'
import { Box, Flex } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface AssetsFiltersContainerProps {
  filters: ReactNode[]
  isSticky?: boolean
  lastWithAutoOffset?: boolean
}

export function AssetsFiltersContainer({
  children,
  filters,
  isSticky = false,
  lastWithAutoOffset = true,
}: PropsWithChildren<AssetsFiltersContainerProps>) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  return (
    <Flex
      sx={{
        position: 'relative',
        ...(!isSmallerScreen && {
          position: isSticky ? 'sticky' : 'relative',
          top: 0,
        }),
        alignItems: ['stretch', null, 'flex-start'],
        flexDirection: ['column', null, 'row'],
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
      <Flex
        sx={{
          flexDirection: ['column', null, 'row'],
          flexWrap: ['wrap', null, null, 'nowrap'],
          gap: '12px',
          flexGrow: 1,
          justifyContent: 'flex-start',
        }}
      >
        {filters.map((filter) => (
          <Box
            sx={{
              flex: ['1', '1 45%', '1'],
              maxWidth: ['none', null, null, '255px'],
              ...(lastWithAutoOffset && {
                '&:last-of-type': {
                  ml: [0, null, null, 'auto'],
                },
              }),
            }}
          >
            {filter}
          </Box>
        ))}
      </Flex>
      {children}
    </Flex>
  )
}
