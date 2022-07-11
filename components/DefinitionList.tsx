import React, { ReactNode } from 'react'
import { Box, SxStyleProp } from 'theme-ui'

interface ListDefinitionProps {
  children: ReactNode
  sx?: SxStyleProp
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
  sx?: SxStyleProp
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
