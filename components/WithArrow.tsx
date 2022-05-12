import React from 'react'
import { Box, SxStyleProp, Text } from 'theme-ui'

export function WithArrow({
  children,
  gap = 2,
  variant = 'paragraph3',
  sx,
}: React.PropsWithChildren<{ gap?: string | number; sx?: SxStyleProp; variant?: string }>) {
  return (
    <Text
      variant={variant}
      sx={{
        fontWeight: 'semiBold',
        fontSize: [1, 2],
        position: 'relative',
        '& .arrow': {
          transition: 'ease-in-out 0.2s',
          transform: 'translateX(0px)',
        },
        '&:hover .arrow': {
          transform: 'translateX(5px)',
        },
        ...sx,
      }}
    >
      <Box sx={{ display: 'inline', mr: gap }}>{children}</Box>
      <Box className="arrow" sx={{ display: 'inline', position: 'absolute' }}>
        →
      </Box>
    </Text>
  )
}
