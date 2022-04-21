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
  onClick?: () => void
  sx?: SxStyleProp
}

export function DefinitionListItem({ children, sx, onClick }: VaultListItemProps) {
  return (
    <Box
      as="li"
      sx={{
        py: 3,
        fontSize: 1,
        listStyle: 'none',
        fontWeight: 'semiBold',
        borderBottom: '1px solid',
        borderBottomColor: 'border',
        '&:last-child': {
          borderBottom: 'none',
        },
        ...sx,
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  )
}
