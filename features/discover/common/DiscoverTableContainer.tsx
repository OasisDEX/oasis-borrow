import React, { PropsWithChildren } from 'react'
import { Box, Heading } from 'theme-ui'

export function DiscoverTableContainer({ children, title }: PropsWithChildren<{ title?: string }>) {
  return (
    <Box
      sx={{
        backgroundColor: 'neutral10',
        borderRadius: 'large',
        boxShadow: 'buttonMenu',
      }}
    >
      {title && (
        <Heading as="h3" variant="boldParagraph2" sx={{ pt: 4, px: 4 }}>
          {title}
        </Heading>
      )}
      {children}
    </Box>
  )
}
