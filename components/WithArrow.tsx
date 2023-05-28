import React from 'react'
import { Box, SxStyleProp, Text } from 'theme-ui'

export function WithArrow({
  children,
  gap = 2,
  variant = 'paragraph3',
  sx,
  as,
}: React.PropsWithChildren<{
  gap?: string | number
  sx?: SxStyleProp
  variant?: string
  as?: React.ElementType
}>) {
  return (
    <Text
      as="span"
      variant={variant}
      sx={{
        display: 'block',
        fontWeight: 'semiBold',
        fontSize: [1, 2],
        position: 'relative',
        '& .arrow': {
          transition: 'transform 200ms',
          transform: 'translateX(0px)',
        },
        '&:hover .arrow': {
          transform: 'translateX(5px)',
        },
        ...sx,
      }}
      {...(as && { as })}
    >
      <Box as="span" sx={{ mr: gap }}>
        {children}
      </Box>
      <Box as="span" className="arrow" sx={{ position: 'absolute' }}>
        →
      </Box>
    </Text>
  )
}
