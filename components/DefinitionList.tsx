import type { ReactNode } from 'react'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box } from 'theme-ui'

interface ListDefinitionProps {
  children: ReactNode
  sx?: ThemeUIStyleObject
  as?: 'ul' | 'ol'
}

export function DefinitionList({ children, sx, as = 'ul' }: ListDefinitionProps) {
  return (
    <Box as={as} sx={{ p: 0, m: 0, ...sx }}>
      {children}
    </Box>
  )
}

interface VaultListItemProps {
  children: ReactNode
  sx?: ThemeUIStyleObject
}

export function DefinitionListItem({ children, sx }: VaultListItemProps) {
  return (
    <Box
      as="li"
      sx={{
        py: 3,
        fontSize: 1,
        listStyle: 'none',
        fontWeight: 'semiBold',
        borderBottom: '1px solid',
        borderBottomColor: 'neutral20',
        '&:last-child': {
          borderBottom: 'none',
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
