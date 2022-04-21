import React, { ReactNode } from 'react'
import { Box, SxStyleProp } from 'theme-ui'

interface ListDefinitionProps {
  children: ReactNode
  sx?: SxStyleProp
  as?: 'ul' | 'ol'
}

export function ListDefinition({ children, sx, as = 'ul' }: ListDefinitionProps) {
  return (
    <Box as={as} sx={{ p: 0, m: 0, ...sx }}>
      {children}
    </Box>
  )
}
