import React from 'react'
import { Box, SxStyleProp, Text } from 'theme-ui'

export function WithArrow({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Text
      variant="paragraph3"
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
      <Box sx={{ display: 'inline', mr: 2 }}>{children}</Box>
      <Box className="arrow" sx={{ display: 'inline', position: 'absolute' }}>
        →
      </Box>
    </Text>
  )
}
